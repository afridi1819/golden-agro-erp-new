package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.Category;
import com.goldenagro.repository.CategoryRepository;
import com.goldenagro.service.ActivityLogService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {

        try {
            return ResponseEntity.ok(
                    ApiResponse.success(categoryRepository.findAll()));

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.success(List.of()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> create(
            @RequestBody Category category) {

        try {

            Category saved = categoryRepository.save(category);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "CATEGORY",
                    "CREATE",
                    saved.getCategoryId().toString(),
                    "Created category: " + saved.getCategoryName(),
                    null,
                    saved.toString());

            return ResponseEntity.ok(
                    ApiResponse.success(saved));

        } catch (Exception e) {

            System.err.println(
                    "Category Create Error: " + e.getMessage());

            return ResponseEntity.ok(
                    ApiResponse.success(null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> update(
            @PathVariable Integer id,
            @RequestBody Category category) {

        try {

            Category oldCategory = categoryRepository.findById(id).orElse(null);

            if (oldCategory == null) {

                return ResponseEntity.ok(
                        ApiResponse.success(null));
            }

            /*
             * Capture old values BEFORE updating.
             *
             * We create a String before save() because
             * the entity may be modified after persistence.
             */
            String oldValues = oldCategory.toString();

            category.setCategoryId(id);

            Category updated = categoryRepository.save(category);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "CATEGORY",
                    "UPDATE",
                    updated.getCategoryId().toString(),
                    "Updated category: " + updated.getCategoryName(),
                    oldValues,
                    updated.toString());

            return ResponseEntity.ok(
                    ApiResponse.success(updated));

        } catch (Exception e) {

            System.err.println(
                    "Category Update Error: " + e.getMessage());

            e.printStackTrace();

            return ResponseEntity.ok(
                    ApiResponse.success(null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id) {

        try {

            Category category = categoryRepository.findById(id).orElse(null);

            if (category == null) {

                return ResponseEntity.ok(
                        ApiResponse.success(null));
            }

            /*
             * Log BEFORE deleting because after deletion
             * we no longer have access to the entity.
             */
            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "CATEGORY",
                    "DELETE",
                    id.toString(),
                    "Deleted category: " + category.getCategoryName(),
                    category.toString(),
                    null);

            categoryRepository.deleteById(id);

            return ResponseEntity.ok(
                    ApiResponse.success(null));

        } catch (Exception e) {

            System.err.println(
                    "Category Delete Error: " + e.getMessage());

            e.printStackTrace();

            return ResponseEntity.ok(
                    ApiResponse.success(null));
        }
    }
}