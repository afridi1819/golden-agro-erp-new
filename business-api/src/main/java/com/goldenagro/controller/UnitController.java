package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Unit;
import com.goldenagro.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {
    private final UnitRepository unitRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Unit>>> getAll() {
        try {
            return ResponseEntity.ok(ApiResponse.success(unitRepository.findAll()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching units: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Unit>> getById(@PathVariable Integer id) {
        try {
            Unit unit = unitRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
            return ResponseEntity.ok(ApiResponse.success(unit));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching unit: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Unit>> create(@RequestBody Unit unit) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Unit created", unitRepository.save(unit)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating unit: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Unit>> update(@PathVariable Integer id, @RequestBody Unit unit) {
        try {
            Unit existingUnit = unitRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
            existingUnit.setUnitName(unit.getUnitName());
            existingUnit.setUnitCode(unit.getUnitCode());
            return ResponseEntity.ok(ApiResponse.success("Unit updated", unitRepository.save(existingUnit)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error updating unit: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            Unit unit = unitRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
            unitRepository.delete(unit);
            return ResponseEntity.ok(ApiResponse.success("Unit deleted", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error deleting unit: " + e.getMessage()));
        }
    }
}