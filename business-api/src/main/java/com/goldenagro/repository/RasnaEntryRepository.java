package com.goldenagro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.goldenagro.model.RasnaEntry;

public interface RasnaEntryRepository extends JpaRepository<RasnaEntry, Integer> {

    List<RasnaEntry> findByCustomerCustomerId(Integer customerId);

    List<RasnaEntry> findBySeason(String season);

    List<RasnaEntry> findByCustomerCustomerIdAndSeason(
            Integer customerId,
            String season);
}