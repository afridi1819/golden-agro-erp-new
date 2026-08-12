package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.Supplier;
import com.goldenagro.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierRepository supplierRepository;

    private String normalizePhone(String phone) {
        if (phone == null) return null;

        String digits = phone.replaceAll("\\D", "");
        if (digits.isBlank()) return "";
        if (digits.length() != 10) {
            throw new IllegalArgumentException("Phone must be exactly 10 digits");
        }
        return digits;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getAll() {
        try {
            return ResponseEntity.ok(ApiResponse.success(supplierRepository.findAll()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching suppliers: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Supplier>>> getActive() {
        try {
            return ResponseEntity.ok(ApiResponse.success(supplierRepository.findByStatus("active")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching active suppliers: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> create(@RequestBody Supplier supplier) {
        try {
            supplier.setPhone(normalizePhone(supplier.getPhone()));
            return ResponseEntity.ok(ApiResponse.success("Supplier created", supplierRepository.save(supplier)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating supplier: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> update(@PathVariable Integer id, @RequestBody Supplier supplier) {
        try {
            supplier.setSupplierId(id);
            supplier.setPhone(normalizePhone(supplier.getPhone()));
            return ResponseEntity.ok(ApiResponse.success("Supplier updated", supplierRepository.save(supplier)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error updating supplier: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow();
        supplier.setStatus("inactive");
        supplierRepository.save(supplier);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}