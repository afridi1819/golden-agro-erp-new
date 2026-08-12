package com.goldenagro.repository;

import com.goldenagro.model.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RawMaterialRepository extends JpaRepository<RawMaterial, Integer> {
    List<RawMaterial> findByStockQuantityLessThanEqual(Integer reorderLevel);
    List<RawMaterial> findByStatus(String status);
}