package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.PurchaseDto;
import com.goldenagro.model.Purchase;
import com.goldenagro.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {
    private final PurchaseService purchaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getAllPurchases() {
        try {
            return ResponseEntity.ok(ApiResponse.success(purchaseService.getAllPurchases()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Purchase>> getPurchaseById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(purchaseService.getPurchaseById(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> createPurchase(@Valid @RequestBody PurchaseDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Purchase created", purchaseService.createPurchase(dto)));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Purchase>> completePurchase(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase completed", purchaseService.completePurchase(id)));
    }
}