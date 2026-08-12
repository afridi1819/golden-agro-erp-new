package com.goldenagro.repository;

import com.goldenagro.model.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Integer> {
    List<ProductionOrder> findByStatus(String status);
    List<ProductionOrder> findByProductProductId(Integer productId);
}