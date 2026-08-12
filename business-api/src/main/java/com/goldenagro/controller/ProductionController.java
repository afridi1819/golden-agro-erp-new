package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.ProductionOrderDto;
import com.goldenagro.model.ProductionOrder;
import com.goldenagro.service.ProductionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {
    private final ProductionService productionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductionOrder>>> getAllProductionOrders() {
        return ResponseEntity.ok(ApiResponse.success(productionService.getAllProductionOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductionOrder>> getProductionOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(productionService.getProductionOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductionOrder>> createProductionOrder(@Valid @RequestBody ProductionOrderDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Production order created", productionService.createProductionOrder(dto)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<ProductionOrder>> startProduction(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Production started", productionService.startProduction(id)));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ProductionOrder>> completeProduction(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Production completed", productionService.completeProduction(id)));
    }

    @PostMapping("/from-retailer-order/{retailerOrderId}")
    public ResponseEntity<ApiResponse<List<ProductionOrder>>> createProductionOrdersFromRetailerOrder(@PathVariable Integer retailerOrderId) {
        try {
            List<ProductionOrder> productionOrders = productionService.createProductionOrdersFromRetailerOrder(retailerOrderId);
            return ResponseEntity.ok(ApiResponse.success("Production orders created from retailer order", productionOrders));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating production orders: " + e.getMessage()));
        }
    }
}