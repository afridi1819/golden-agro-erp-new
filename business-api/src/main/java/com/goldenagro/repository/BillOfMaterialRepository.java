package com.goldenagro.repository;

import com.goldenagro.model.BillOfMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillOfMaterialRepository extends JpaRepository<BillOfMaterial, Integer> {
    List<BillOfMaterial> findByProductProductId(Integer productId);
    Optional<BillOfMaterial> findByProductProductIdAndIsActiveTrue(Integer productId);
}