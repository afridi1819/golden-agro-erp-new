package com.goldenagro.repository;

import com.goldenagro.model.RetailerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RetailerOrderRepository extends JpaRepository<RetailerOrder, Integer> {
    List<RetailerOrder> findByRetailerRetailerId(Integer retailerId);
    List<RetailerOrder> findByStatus(String status);
    List<RetailerOrder> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}