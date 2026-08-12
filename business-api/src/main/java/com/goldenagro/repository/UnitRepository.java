package com.goldenagro.repository;

import com.goldenagro.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Integer> {
    Optional<Unit> findByUnitCode(String unitCode);
}