package com.goldenagro.repository;

import com.goldenagro.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    List<Supplier> findByStatus(String status);
}