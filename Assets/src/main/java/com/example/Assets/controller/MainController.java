package com.example.Assets.controller;

import com.example.Assets.model.Asset;
import com.example.Assets.repository.AssetRepository;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/local")
@CrossOrigin(origins = "*")
public class MainController {

    private final AssetRepository assetRepository;

    // Using File.separator ensures path compatibility across Windows/Linux/Mac
    private final String WORKSPACE = System.getProperty("user.dir") + File.separator + "KeyedVault";
    private final String ORIGINALS_DIR = WORKSPACE + File.separator + "Originals";
    private final String PROTECTED_DIR = WORKSPACE + File.separator + "Protected";

    @Autowired
    public MainController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
        // Securely initialize workspace directories on startup
        new File(ORIGINALS_DIR).mkdirs();
        new File(PROTECTED_DIR).mkdirs();
    }

    @GetMapping("/ledger")
    public ResponseEntity<@Nullable Object> getLedger() {
        return ResponseEntity.ok(assetRepository.findAll());
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("authorId") String authorId) {

        Map<String, Object> response = new HashMap<>();

        // 1. Validation Guardrail
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            response.put("status", "ERROR");
            response.put("message", "Rejected: Uploaded file is empty or invalid.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String originalFileName = file.getOriginalFilename();
            // Generate a secure 12-character Hex UUID
            String fileHash = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

            // 2. Safely save the original file using NIO Streams
            Path originalPath = Paths.get(ORIGINALS_DIR, fileHash + "_" + originalFileName);
            Files.copy(file.getInputStream(), originalPath, StandardCopyOption.REPLACE_EXISTING);

            // 3. Define output path
            String protectedFileName = "KEYED_" + fileHash + "_" + originalFileName;
            Path protectedPath = Paths.get(PROTECTED_DIR, protectedFileName);

            // 4. Multi-OS Python Execution Trigger
            String pythonCmd = System.getProperty("os.name").toLowerCase().contains("win") ? "python" : "python3";
            ProcessBuilder pb = new ProcessBuilder(
                    pythonCmd, "watermark_engine.py",
                    originalPath.toAbsolutePath().toString(),
                    protectedPath.toAbsolutePath().toString(),
                    authorId,
                    fileHash);

            // Merge Python's standard error and standard output
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // 5. Harvest Python output for robust debugging
            StringBuilder pythonLogs = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    pythonLogs.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();

            if (exitCode == 0) {
                // 6. Ledger Injection (Database Save)
                Asset newAsset = new Asset(fileHash, originalFileName, authorId);
                assetRepository.save(newAsset);

                response.put("status", "SUCCESS");
                response.put("hash", fileHash);
                response.put("message", "Asset cryptographically hardened and ledgered.");
                return ResponseEntity.ok(response);
            } else {
                // 7. Powerful Error Handling: Return exact Python crash logs to frontend
                response.put("status", "ERROR");
                response.put("message", "Python Engine failed with exit code: " + exitCode);
                response.put("python_traceback", pythonLogs.toString().trim());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

        } catch (Exception e) {
            // Catch-all for IO or runtime fatals
            response.put("status", "FATAL_ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}