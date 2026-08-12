package com.goldenagro.repository;

import com.goldenagro.model.Tax;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaxRepository extends JpaRepository<Tax, Integer> {
    Optional<Tax> findByTaxName(String taxName);
}