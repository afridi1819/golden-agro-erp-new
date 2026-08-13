package com.goldenagro.controller;

import java.util.List;
import java.util.Map;

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
import com.goldenagro.dto.ProductDto;
import com.goldenagro.model.Product;
import com.goldenagro.service.ActivityLogService;
import com.goldenagro.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ActivityLogService activityLogService;

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

            Product product = productService.createProduct(dto);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "PRODUCT",
                    "CREATE",
                    product.getProductId().toString(),
                    "Created product: " + product.getProductName(),
                    null,
                    product.toString()
            );

            return ResponseEntity.ok(ApiResponse.success("Product created", product));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating product: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductDto dto) {

        Product oldProduct = productService.getProductById(id);

        Product updatedProduct = productService.updateProduct(id, dto);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "PRODUCT",
                "UPDATE",
                id.toString(),
                "Updated product: " + updatedProduct.getProductName(),
                oldProduct.toString(),
                updatedProduct.toString()
        );

        return ResponseEntity.ok(ApiResponse.success("Product updated", updatedProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {

        Product oldProduct = productService.getProductById(id);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "PRODUCT",
                "DELETE",
                id.toString(),
                "Deleted product: " + oldProduct.getProductName(),
                oldProduct.toString(),
                null
        );

        productService.deleteProduct(id);

        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }
}
