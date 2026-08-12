package com.goldenagro.service;

import com.goldenagro.dto.ProductDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.*;
import com.goldenagro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final TaxRepository taxRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final FinishedGoodsStockRepository stockRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByStatus("active");
    }

    public List<Map<String, Object>> getProductsWithStock() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Product product : products) {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("productId", product.getProductId());
            productMap.put("productName", product.getProductName());
            productMap.put("sellingPrice", product.getSellingPrice());
            productMap.put("costPrice", product.getCostPrice());
            productMap.put("category", product.getCategory());
            productMap.put("tax", product.getTax());
            productMap.put("unit", product.getUnit());
            productMap.put("status", product.getStatus());
            
            // Get stock quantity
            Integer stockQty = stockRepository.findByProductProductId(product.getProductId())
                    .map(FinishedGoodsStock::getQuantity)
                    .orElse(0);
            productMap.put("availableStock", stockQty);
            
            result.add(productMap);
        }
        return result;
    }

    public Product getProductById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public Product createProduct(ProductDto dto) {
        try {
            Product product = new Product();
            product.setProductName(dto.getProductName());
            product.setSellingPrice(dto.getSellingPrice());
            product.setCostPrice(dto.getCostPrice());
            product.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");

            if (dto.getTaxId() != null) {
                Tax tax = taxRepository.findById(dto.getTaxId())
                        .orElseThrow(() -> new ResourceNotFoundException("Tax not found"));
                product.setTax(tax);
            }

            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
                product.setCategory(category);
            }

            if (dto.getUnitId() != null) {
                Unit unit = unitRepository.findById(dto.getUnitId())
                        .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));
                product.setUnit(unit);
            }

            return productRepository.save(product);
        } catch (Exception e) {
            throw new RuntimeException("Error creating product: " + e.getMessage(), e);
        }
    }

    public Product updateProduct(Integer id, ProductDto dto) {
        Product product = getProductById(id);
        product.setProductName(dto.getProductName());
        product.setSellingPrice(dto.getSellingPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");

        if (dto.getTaxId() != null) {
            Tax tax = taxRepository.findById(dto.getTaxId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tax not found"));
            product.setTax(tax);
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        if (dto.getUnitId() != null) {
            Unit unit = unitRepository.findById(dto.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));
            product.setUnit(unit);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        Product product = getProductById(id);
        product.setStatus("inactive");
        productRepository.save(product);
    }
}