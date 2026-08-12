package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.RawMaterial;
import com.goldenagro.repository.RawMaterialRepository;
import com.goldenagro.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {
    private final RawMaterialRepository rawMaterialRepository;
    private final UnitRepository unitRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RawMaterial>>> getAll() {
        try {
            return ResponseEntity.ok(ApiResponse.success(rawMaterialRepository.findAll()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<RawMaterial>>> getLowStock() {
        try {
            List<RawMaterial> materials = rawMaterialRepository.findByStockQuantityLessThanEqual(10);
            return ResponseEntity.ok(ApiResponse.success(materials));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RawMaterial>> create(@RequestBody RawMaterial material) {
        try {
            return ResponseEntity.ok(ApiResponse.success(rawMaterialRepository.save(material)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RawMaterial>> update(@PathVariable Integer id, @RequestBody RawMaterial material) {
        material.setRawMaterialId(id);
        try {
            return ResponseEntity.ok(ApiResponse.success(rawMaterialRepository.save(material)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }
}