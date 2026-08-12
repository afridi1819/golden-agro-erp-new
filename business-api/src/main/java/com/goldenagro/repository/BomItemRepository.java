package com.goldenagro.repository;

import com.goldenagro.model.BomItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BomItemRepository extends JpaRepository<BomItem, Integer> {
    
    List<BomItem> findByBom_BomId(Integer bomId);
    
    @Modifying
    @Query("DELETE FROM BomItem bi WHERE bi.bom.bomId = :bomId")
    void deleteByBom_BomId(@Param("bomId") Integer bomId);
}
