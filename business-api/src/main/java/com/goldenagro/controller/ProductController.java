package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.ProductDto;
import com.goldenagro.model.Product;
import com.goldenagro.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
        try {
            return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching products: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Product>>> getActiveProducts() {
        try {
            return ResponseEntity.ok(ApiResponse.success(productService.getActiveProducts()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching active products: " + e.getMessage()));
        }
    }

    @GetMapping("/with-stock")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProductsWithStock() {
        try {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductsWithStock()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching products with stock: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody ProductDto dto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Product created", productService.createProduct(dto)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating product: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Integer id, @Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }
}