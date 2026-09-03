package com.goldenagro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.goldenagro.model.PioProduction;

public interface PioProductionRepository
        extends JpaRepository<PioProduction, Integer> {

    List<PioProduction> findByEntryDate(LocalDate entryDate);

    List<PioProduction> findBySeason(String season);

    List<PioProduction> findByEntryDateLessThanEqual(LocalDate entryDate);
}