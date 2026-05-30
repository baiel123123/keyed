package com.example.Assets.controller;

import com.example.Assets.auth.CustomUserDetails;
import com.example.Assets.model.Asset;
import com.example.Assets.repository.AssetRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
public class VaultController {

    private final AssetRepository assetRepository;
    private final Path protectedDir;
    private final Path originalsDir;

    public VaultController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
        String base = System.getProperty("user.dir") + File.separator + "KeyedVault";
        this.protectedDir = Paths.get(base + File.separator + "Protected");
        this.originalsDir = Paths.get(base + File.separator + "Originals");
    }

    @GetMapping("/api/local/file/{hash}")
    public ResponseEntity<Resource> downloadByHash(@PathVariable String hash) throws Exception {
        if (hash == null || hash.isBlank() || hash.equals("undefined")) {
            return ResponseEntity.badRequest().build();
        }

        Asset asset = assetRepository.findByAssetHash(hash).orElse(null);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }

        String prefix = "KEYED_" + hash + "_";
        File[] matches = protectedDir.toFile().listFiles(f -> f.getName().startsWith(prefix) && f.isFile());
        if (matches != null && matches.length > 0) {
            return serveFile(protectedDir, matches[0].getName());
        }

        File[] origMatches = originalsDir.toFile().listFiles(f -> f.getName().startsWith(hash + "_") && f.isFile());
        if (origMatches != null && origMatches.length > 0) {
            return serveFile(originalsDir, origMatches[0].getName());
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/vault/protected/{filename:.+}")
    public ResponseEntity<Resource> serveProtectedFile(
            @PathVariable String filename,
            @AuthenticationPrincipal CustomUserDetails user) throws Exception {

        String assetHash = extractAssetHash(filename);
        if (assetHash == null) {
            return ResponseEntity.notFound().build();
        }

        Asset asset = assetRepository.findByAssetHash(assetHash).orElse(null);
        if (asset == null || !asset.getAuthorId().equals(user.getAuthorId())) {
            return ResponseEntity.status(403).build(); // 403 Forbidden, если файл чужой
        }

        return serveFile(protectedDir, filename);
    }

    // Вспомогательный метод для безопасной отдачи файла
    private ResponseEntity<Resource> serveFile(Path dir, String filename) throws Exception {
        Path filePath = dir.resolve(filename).normalize();

        // Проверка на Directory Traversal уязвимость и существование файла
        if (!filePath.startsWith(dir) || !Files.isRegularFile(filePath)) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    /** Ожидаемый формат: KEYED_{12-char-hash}_{originalFileName} */
    private String extractAssetHash(String filename) {
        if (!filename.startsWith("KEYED_")) {
            return null;
        }
        String rest = filename.substring(6);
        int sep = rest.indexOf('_');
        if (sep <= 0) {
            return null;
        }
        return rest.substring(0, sep);
    }
}