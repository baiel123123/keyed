package com.example.Assets.service;

import com.example.Assets.model.Asset;
import com.example.Assets.model.model;
import com.example.Assets.repository.AssetRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AService {
    private static final Logger log = LoggerFactory.getLogger(AService.class);

    private final AssetRepository assetRepository;

    private final String WORKSPACE = System.getProperty("user.dir") + File.separator + "KeyedVault";
    private final String ORIGINALS_DIR = WORKSPACE + File.separator + "Originals";
    private final String PROTECTED_DIR = WORKSPACE + File.separator + "Protected";

    private static final Set<String> IMAGE_EXTENSIONS = Set.of(".png", ".jpg", ".jpeg", ".bmp", ".webp");

    /** Directory containing phash_engine.py and watermark_engine.py */
    private final String pythonScriptsDir = resolvePythonScriptsDir();

    @Autowired
    public AService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    private static String resolvePythonScriptsDir() {
        String userDir = System.getProperty("user.dir");

        File inAssets = new File(userDir, "Assets" + File.separator + "phash_engine.py");
        if (inAssets.isFile()) {
            return inAssets.getParent();
        }

        File inCwd = new File(userDir, "phash_engine.py");
        if (inCwd.isFile()) {
            return userDir;
        }

        throw new IllegalStateException("Python engines not found. Expected phash_engine.py under: " + userDir);
    }

    private static String pythonCommand() {
        return System.getProperty("os.name").toLowerCase(Locale.ROOT).contains("win") ? "python" : "python3";
    }

    @PostConstruct
    public void initVault() {
        try {
            Files.createDirectories(Paths.get(ORIGINALS_DIR));
            Files.createDirectories(Paths.get(PROTECTED_DIR));
        } catch (IOException e) {
            log.error("Не удалось создать директории хранилища: {}", e.getMessage());
        }
    }

    public List<Asset> getLedgerForAuthor(String authorId) {
        return assetRepository.findByAuthorId(authorId);
    }

    /**
     * HELPER: Runs the pHash python engine to get the perceptual hash
     */
    private String generatePHash(String imagePath) throws Exception {
        String scriptPath = pythonScriptsDir + File.separator + "phash_engine.py";
        ProcessBuilder pb = new ProcessBuilder(pythonCommand(), scriptPath, imagePath);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        String pHash = null;

        while ((line = reader.readLine()) != null) {
            output.append(line).append('\n');
            if (line.startsWith("PHASH_RESULT=")) {
                pHash = line.replace("PHASH_RESULT=", "").trim();
            } else if (line.startsWith("PHASH_ERROR=")) {
                throw new Exception("Python pHash Engine Error: " + line);
            }
        }
        int exitCode = process.waitFor();

        if (pHash == null) {
            throw new Exception("Failed to extract pHash (exit " + exitCode + "): " + output.toString().trim());
        }
        return pHash;
    }

    /**
     * Core Enterprise Logic: Validates, saves, protects via Python, and ledgers the file.
     */
    public model<Asset> processAndProtectAsset(MultipartFile file, String authorId) {
        // 1. Initial Validation
        if (file == null || file.isEmpty() || file.getOriginalFilename() == null) {
            return model.error("Upload failed: File is empty or corrupted.");
        }

        try {
            String originalFileName = file.getOriginalFilename();
            String fileHash = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

            Path originalPath = Paths.get(ORIGINALS_DIR, fileHash + "_" + originalFileName);
            Files.copy(file.getInputStream(), originalPath, StandardCopyOption.REPLACE_EXISTING);

            // 2. Visual duplicate check (images only)
            String pHash = null;
            if (isImage(originalFileName)) {
                pHash = generatePHash(originalPath.toAbsolutePath().toString());

                if (assetRepository.existsBypHash(pHash)) {
                    Files.deleteIfExists(originalPath);
                    return model.error("SECURITY ALERT: This or a visually identical asset is already protected in the Vault!");
                }
            }

            // 3. Prepare Python Engine execution (Watermark)
            String protectedFileName = "KEYED_" + fileHash + "_" + originalFileName;
            Path protectedPath = Paths.get(PROTECTED_DIR, protectedFileName);
            String watermarkScript = pythonScriptsDir + File.separator + "watermark_engine.py";

            ProcessBuilder pb = new ProcessBuilder(
                    pythonCommand(), watermarkScript,
                    originalPath.toAbsolutePath().toString(),
                    protectedPath.toAbsolutePath().toString(),
                    authorId,
                    fileHash
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // 4. Harvest Python Logs
            StringBuilder pythonLogs = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    pythonLogs.append(line).append("\n");
                    log.debug("Python: {}", line);
                }
            }

            int exitCode = process.waitFor();

            // 5. Evaluate Result and Update Database
            if (exitCode == 0) {
                Asset newAsset = new Asset(fileHash, originalFileName, authorId);
                if (pHash != null) {
                    newAsset.setPHash(pHash);
                }
                assetRepository.save(newAsset);
                return model.success("Asset successfully secured, checked for duplicates, and ledgered.", newAsset);
            } else {
                // Если скрипт водяных знаков упал — удаляем оригинальный файл, чтобы не засорять память
                Files.deleteIfExists(originalPath);
                return model.error("Python Engine Failed: " + pythonLogs.toString().trim());
            }

        } catch (Exception e) {
            log.error("Критическая ошибка процесса: ", e);
            return model.error("Fatal Internal Error: " + e.getMessage());
        }
    }

    private boolean isImage(String fileName) {
        if (fileName == null) return false;
        String lowerName = fileName.toLowerCase(Locale.ROOT);
        return IMAGE_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
    }
}