package com.goldenagro.repository;

import com.goldenagro.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByStatus(String status);
    List<Product> findByCategoryCategoryId(Integer categoryId);
}