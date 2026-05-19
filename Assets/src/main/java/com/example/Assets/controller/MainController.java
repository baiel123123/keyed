package com.example.Assets.controller;

import com.example.Assets.model.Asset;
import com.example.Assets.model.model;
import com.example.Assets.service.AService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/local")
@CrossOrigin(origins = "*")
public class MainController {

    private final AService aService;

    public MainController(AService aService) {
        this.aService = aService;
    }

    @GetMapping("/ledger")
    public ResponseEntity<List<Asset>> getLedger() {
        return ResponseEntity.ok(aService.getLedger());
    }

    @PostMapping("/process")
    public ResponseEntity<model<Asset>> processFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("authorId") String authorId) {

        model<Asset> result = aService.processAndProtectAsset(file, authorId);

        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }

        HttpStatus status = result.getMessage() != null
                && result.getMessage().toLowerCase().contains("empty")
                        ? HttpStatus.BAD_REQUEST
                        : HttpStatus.INTERNAL_SERVER_ERROR;

        return ResponseEntity.status(status).body(result);
    }
}
