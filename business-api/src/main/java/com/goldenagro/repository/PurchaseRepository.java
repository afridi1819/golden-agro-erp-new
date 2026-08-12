package com.goldenagro.repository;

import com.goldenagro.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Integer> {
    List<Purchase> findByPurchaseDateBetween(LocalDateTime start, LocalDateTime end);
    List<Purchase> findBySupplierSupplierId(Integer supplierId);
    List<Purchase> findByStatus(String status);
}