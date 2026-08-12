package com.goldenagro.repository;

import com.goldenagro.model.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RetailerRepository extends JpaRepository<Retailer, Integer> {
    List<Retailer> findByStatus(String status);
    Optional<Retailer> findByAuthUserId(String authUserId);
}