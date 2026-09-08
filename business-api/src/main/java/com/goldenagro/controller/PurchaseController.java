package com.goldenagro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.PurchaseDto;
import com.goldenagro.model.Purchase;
import com.goldenagro.service.PurchaseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

        private final PurchaseService purchaseService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<Purchase>>> getAllPurchases() {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                purchaseService.getAllPurchases()));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<Purchase>> getPurchaseById(
                        @PathVariable Integer id) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                purchaseService.getPurchaseById(id)));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<Purchase>> createPurchase(
                        @Valid @RequestBody PurchaseDto dto) {

                Purchase purchase = purchaseService.createPurchase(dto);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Purchase created successfully",
                                                purchase));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<Purchase>> updatePurchase(
                        @PathVariable Integer id,
                        @Valid @RequestBody PurchaseDto dto) {

                System.out.println(
                                "UPDATE PURCHASE REQUEST RECEIVED FOR ID: " + id);

                Purchase purchase = purchaseService.updatePurchase(id, dto);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Purchase updated successfully",
                                                purchase));
        }

        @PostMapping("/{id}/complete")
        public ResponseEntity<ApiResponse<Purchase>> completePurchase(
                        @PathVariable Integer id) {

                System.out.println(
                                "COMPLETE PURCHASE REQUEST RECEIVED FOR ID: " + id);

                Purchase purchase = purchaseService.completePurchase(id);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Purchase completed successfully",
                                                purchase));
        }

        @PostMapping("/{id}/cancel")
        public ResponseEntity<ApiResponse<Purchase>> cancelPurchase(
                        @PathVariable Integer id) {

                Purchase purchase = purchaseService.cancelPurchase(id);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Purchase cancelled successfully",
                                                purchase));
        }
}