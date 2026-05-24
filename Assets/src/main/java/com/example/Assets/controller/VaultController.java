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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@CrossOrigin(origins = "https://keyed-fxn2ia7mb-baiel123123s-projects.vercel.app/")
@RestController
public class VaultController {

    private final AssetRepository assetRepository;
    private final Path protectedDir;

    public VaultController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
        String base = System.getProperty("user.dir") + File.separator + "KeyedVault" + File.separator + "Protected";
        this.protectedDir = Paths.get(base);
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
            return ResponseEntity.status(403).build();
        }

        Path filePath = protectedDir.resolve(filename).normalize();
        if (!filePath.startsWith(protectedDir) || !Files.isRegularFile(filePath)) {
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

    /** KEYED_{12-char-hash}_{originalFileName} */
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
