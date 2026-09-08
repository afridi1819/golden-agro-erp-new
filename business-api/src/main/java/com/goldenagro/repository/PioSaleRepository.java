package com.goldenagro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.goldenagro.model.PioSale;

public interface PioSaleRepository
        extends JpaRepository<PioSale, Integer> {

    List<PioSale> findByCustomerCustomerId(Integer customerId);

    List<PioSale> findBySeason(String season);

    List<PioSale> findByCustomerCustomerIdAndSeason(
            Integer customerId,
            String season);

    List<PioSale> findByEntryDate(LocalDate entryDate);

    List<PioSale> findByEntryDateLessThanEqual(LocalDate entryDate);
}