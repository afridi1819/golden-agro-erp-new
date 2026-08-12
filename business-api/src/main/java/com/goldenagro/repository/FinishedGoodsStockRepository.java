package com.goldenagro.repository;

import com.goldenagro.model.FinishedGoodsStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FinishedGoodsStockRepository extends JpaRepository<FinishedGoodsStock, Integer> {
    Optional<FinishedGoodsStock> findByProductProductId(Integer productId);
}