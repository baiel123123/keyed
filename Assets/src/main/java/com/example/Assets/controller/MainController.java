package com.example.Assets.controller;

import com.example.Assets.auth.CustomUserDetails;
import com.example.Assets.model.Asset;
import com.example.Assets.model.model;
import com.example.Assets.service.AService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "https://keyed-fxn2ia7mb-baiel123123s-projects.vercel.app/")
@RestController
@RequestMapping("/api/local")
public class MainController {

    private final AService aService;

    public MainController(AService aService) {
        this.aService = aService;
    }

    @GetMapping("/ledger")
    public ResponseEntity<List<Asset>> getLedger(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(aService.getLedgerForAuthor(user.getAuthorId()));
    }

    @PostMapping("/process")
    public ResponseEntity<model<Asset>> processFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails user) {

        model<Asset> result = aService.processAndProtectAsset(file, user.getAuthorId());

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
