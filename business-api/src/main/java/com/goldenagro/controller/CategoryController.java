package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.Category;
import com.goldenagro.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(categoryRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody Category category) {
        return ResponseEntity.ok(ApiResponse.success(categoryRepository.save(category)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> update(@PathVariable Integer id, @RequestBody Category category) {
        category.setCategoryId(id);
        return ResponseEntity.ok(ApiResponse.success(categoryRepository.save(category)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}