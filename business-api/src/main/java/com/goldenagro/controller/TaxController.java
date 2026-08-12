package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Tax;
import com.goldenagro.repository.TaxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
@RequiredArgsConstructor
public class TaxController {
    private final TaxRepository taxRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Tax>>> getAll() {
        try {
            return ResponseEntity.ok(ApiResponse.success(taxRepository.findAll()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching taxes: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Tax>> getById(@PathVariable Integer id) {
        try {
            Tax tax = taxRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));
            return ResponseEntity.ok(ApiResponse.success(tax));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching tax: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Tax>> create(@RequestBody Tax tax) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Tax created", taxRepository.save(tax)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating tax: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Tax>> update(@PathVariable Integer id, @RequestBody Tax tax) {
        try {
            Tax existingTax = taxRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));
            existingTax.setTaxName(tax.getTaxName());
            existingTax.setTaxRate(tax.getTaxRate());
            return ResponseEntity.ok(ApiResponse.success("Tax updated", taxRepository.save(existingTax)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error updating tax: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            Tax tax = taxRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));
            taxRepository.delete(tax);
            return ResponseEntity.ok(ApiResponse.success("Tax deleted", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error deleting tax: " + e.getMessage()));
        }
    }
}