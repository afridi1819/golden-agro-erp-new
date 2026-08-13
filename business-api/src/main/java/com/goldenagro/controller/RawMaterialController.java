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
import com.goldenagro.model.RawMaterial;
import com.goldenagro.repository.RawMaterialRepository;
import com.goldenagro.repository.UnitRepository;
import com.goldenagro.service.ActivityLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialRepository rawMaterialRepository;
    private final UnitRepository unitRepository;
    private final ActivityLogService activityLogService;

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

            RawMaterial saved = rawMaterialRepository.save(material);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "RAW_MATERIAL",
                    "CREATE",
                    saved.getRawMaterialId().toString(),
                    "Created raw material: " + saved.getMaterialName(),
                    null,
                    saved.toString()
            );

            return ResponseEntity.ok(ApiResponse.success(saved));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RawMaterial>> update(
            @PathVariable Integer id,
            @RequestBody RawMaterial material) {

        material.setRawMaterialId(id);

        try {

            RawMaterial oldMaterial =
                    rawMaterialRepository.findById(id).orElse(null);

            RawMaterial updated =
                    rawMaterialRepository.save(material);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "RAW_MATERIAL",
                    "UPDATE",
                    updated.getRawMaterialId().toString(),
                    "Updated raw material: " + updated.getMaterialName(),
                    oldMaterial != null ? oldMaterial.toString() : null,
                    updated.toString()
            );

            return ResponseEntity.ok(ApiResponse.success(updated));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Integer id) {

        try {

            RawMaterial material =
                    rawMaterialRepository.findById(id).orElse(null);

            if (material == null) {
                return ResponseEntity.ok(
                        ApiResponse.success("Raw material not found"));
            }

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "RAW_MATERIAL",
                    "DELETE",
                    id.toString(),
                    "Deleted raw material: " + material.getMaterialName(),
                    material.toString(),
                    null
            );

            rawMaterialRepository.deleteById(id);

            return ResponseEntity.ok(
                    ApiResponse.success("Raw material deleted successfully"));

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.success("Failed to delete raw material"));
        }
    }
}