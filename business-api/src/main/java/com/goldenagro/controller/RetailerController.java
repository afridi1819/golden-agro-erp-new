package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.NetRetailerSyncDto;
import com.goldenagro.dto.RetailerDto;
import com.goldenagro.model.Retailer;
import com.goldenagro.service.RetailerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retailers")
@RequiredArgsConstructor
public class RetailerController {
    private final RetailerService retailerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Retailer>>> getAllRetailers() {
        try {
            return ResponseEntity.ok(ApiResponse.success(retailerService.getAllRetailers()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Retailer>>> getActiveRetailers() {
        try {
            return ResponseEntity.ok(ApiResponse.success(retailerService.getActiveRetailers()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Retailer>> getRetailerById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(retailerService.getRetailerById(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Retailer>> createRetailer(@Valid @RequestBody RetailerDto dto) {
        try {
            Retailer retailer = retailerService.createRetailer(dto);
            return ResponseEntity.ok(ApiResponse.success("Retailer created", retailer));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating retailer: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Retailer>> updateRetailer(@PathVariable Integer id, @Valid @RequestBody RetailerDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Retailer updated", retailerService.updateRetailer(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRetailer(@PathVariable Integer id) {
        retailerService.deleteRetailer(id);
        return ResponseEntity.ok(ApiResponse.success("Retailer deleted", null));
    }

    // .NET Integration endpoint for retailer sync during registration/login
    @PostMapping("/sync-from-net")
    public ResponseEntity<ApiResponse<Retailer>> syncRetailerFromNet(@Valid @RequestBody NetRetailerSyncDto dto) {
        try {
            System.out.println("Syncing retailer from .NET: " + dto.getRetailerId() + " - " + dto.getShopName());
            
            // Check if retailer already exists
            Retailer existingRetailer = retailerService.getRetailerByIdOrNull(dto.getRetailerId());
            
            if (existingRetailer != null) {
                System.out.println("Retailer already exists, updating: " + existingRetailer.getShopName());
                // Update existing retailer with latest info
                existingRetailer.setShopName(dto.getShopName());
                existingRetailer.setOwnerName(dto.getOwnerName());
                existingRetailer.setEmail(dto.getEmail());
                existingRetailer.setPhone(dto.getPhone());
                existingRetailer.setAddress(dto.getAddress());
                existingRetailer.setGstNumber(dto.getGstNumber());
                existingRetailer.setStatus(dto.getStatus());
                
                Retailer updatedRetailer = retailerService.updateRetailer(existingRetailer.getRetailerId(), 
                    convertToRetailerDto(existingRetailer));
                return ResponseEntity.ok(ApiResponse.success("Retailer updated from .NET", updatedRetailer));
            } else {
                System.out.println("Creating new retailer from .NET: " + dto.getShopName());
                // Create new retailer
                Retailer newRetailer = new Retailer();
                newRetailer.setRetailerId(dto.getRetailerId());
                newRetailer.setShopName(dto.getShopName());
                newRetailer.setOwnerName(dto.getOwnerName());
                newRetailer.setEmail(dto.getEmail());
                newRetailer.setPhone(dto.getPhone() != null ? dto.getPhone() : "0000000000");
                newRetailer.setAddress(dto.getAddress() != null ? dto.getAddress() : "Default Address");
                newRetailer.setGstNumber(dto.getGstNumber() != null ? dto.getGstNumber() : "GST" + dto.getRetailerId());
                newRetailer.setStatus(dto.getStatus());
                
                Retailer createdRetailer = retailerService.createRetailerFromNet(newRetailer);
                return ResponseEntity.ok(ApiResponse.success("Retailer created from .NET", createdRetailer));
            }
        } catch (Exception e) {
            System.err.println("Error syncing retailer from .NET: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.error("Error syncing retailer: " + e.getMessage()));
        }
    }

    private RetailerDto convertToRetailerDto(Retailer retailer) {
        RetailerDto dto = new RetailerDto();
        dto.setShopName(retailer.getShopName());
        dto.setOwnerName(retailer.getOwnerName());
        dto.setEmail(retailer.getEmail());
        dto.setPhone(retailer.getPhone());
        dto.setAddress(retailer.getAddress());
        dto.setGstNumber(retailer.getGstNumber());
        dto.setStatus(retailer.getStatus());
        return dto;
    }
}