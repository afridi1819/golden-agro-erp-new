package com.goldenagro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.Supplier;
import com.goldenagro.repository.SupplierRepository;
import com.goldenagro.service.ActivityLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

        private final SupplierRepository supplierRepository;
        private final ActivityLogService activityLogService;

        private String normalizePhone(String phone) {
                if (phone == null)
                        return null;

                String digits = phone.replaceAll("\\D", "");
                if (digits.isBlank())
                        return "";

                if (digits.length() != 10) {
                        throw new IllegalArgumentException("Phone must be exactly 10 digits");
                }

                return digits;
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<Supplier>>> getAll() {
                try {
                        return ResponseEntity.ok(
                                        ApiResponse.success(
                                                        supplierRepository.findAll()));
                } catch (Exception e) {
                        return ResponseEntity.ok(
                                        ApiResponse.error(
                                                        "Error fetching suppliers: " + e.getMessage()));
                }
        }

        @GetMapping("/active")
        public ResponseEntity<ApiResponse<List<Supplier>>> getActive() {
                try {
                        return ResponseEntity.ok(
                                        ApiResponse.success(
                                                        supplierRepository.findByStatus("active")));
                } catch (Exception e) {
                        return ResponseEntity.ok(
                                        ApiResponse.error(
                                                        "Error fetching active suppliers: " + e.getMessage()));
                }
        }

        @PostMapping
        public ResponseEntity<ApiResponse<Supplier>> create(
                        @RequestBody Supplier supplier) {

                try {

                        supplier.setPhone(
                                        normalizePhone(supplier.getPhone()));

                        Supplier savedSupplier = supplierRepository.save(supplier);

                        activityLogService.log(
                                        0,
                                        "System",
                                        "Admin",
                                        "SUPPLIER",
                                        "CREATE",
                                        savedSupplier.getSupplierId().toString(),
                                        "Created supplier: " + savedSupplier.getSupplierName(),
                                        null,
                                        savedSupplier.toString());

                        return ResponseEntity.ok(
                                        ApiResponse.success(
                                                        "Supplier created",
                                                        savedSupplier));

                } catch (IllegalArgumentException e) {

                        return ResponseEntity.ok(
                                        ApiResponse.error(e.getMessage()));

                } catch (Exception e) {

                        return ResponseEntity.ok(
                                        ApiResponse.error(
                                                        "Error creating supplier: " + e.getMessage()));
                }
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<Supplier>> update(
                        @PathVariable Integer id,
                        @RequestBody Supplier supplier) {

                try {

                        Supplier existingSupplier = supplierRepository.findById(id)
                                        .orElseThrow();

                        String oldValues = existingSupplier.toString();

                        supplier.setSupplierId(id);
                        supplier.setPhone(
                                        normalizePhone(supplier.getPhone()));

                        Supplier updatedSupplier = supplierRepository.save(supplier);

                        activityLogService.log(
                                        0,
                                        "System",
                                        "Admin",
                                        "SUPPLIER",
                                        "UPDATE",
                                        updatedSupplier.getSupplierId().toString(),
                                        "Updated supplier: " + updatedSupplier.getSupplierName(),
                                        oldValues,
                                        updatedSupplier.toString());

                        return ResponseEntity.ok(
                                        ApiResponse.success(
                                                        "Supplier updated",
                                                        updatedSupplier));

                } catch (IllegalArgumentException e) {

                        return ResponseEntity.ok(
                                        ApiResponse.error(e.getMessage()));

                } catch (Exception e) {

                        return ResponseEntity.ok(
                                        ApiResponse.error(
                                                        "Error updating supplier: " + e.getMessage()));
                }
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(
                        @PathVariable Integer id) {

                try {

                        Supplier supplier = supplierRepository.findById(id)
                                        .orElseThrow(() -> new RuntimeException("Supplier not found"));

                        String oldValues = supplier.toString();

                        supplier.setStatus("inactive");

                        Supplier updatedSupplier = supplierRepository.save(supplier);

                        activityLogService.log(
                                        0,
                                        "System",
                                        "Admin",
                                        "SUPPLIER",
                                        "DELETE",
                                        updatedSupplier.getSupplierId().toString(),
                                        "Deleted supplier: " + updatedSupplier.getSupplierName(),
                                        oldValues,
                                        updatedSupplier.toString());

                        return ResponseEntity.ok(
                                        ApiResponse.success(null));

                } catch (Exception e) {

                        System.err.println(
                                        "Supplier Delete Error: " + e.getMessage());

                        e.printStackTrace();

                        return ResponseEntity.ok(
                                        ApiResponse.error(
                                                        "Error deleting supplier: " + e.getMessage()));
                }
        }

}