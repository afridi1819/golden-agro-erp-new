package com.goldenagro.config;

import com.goldenagro.model.*;
import com.goldenagro.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UnitRepository unitRepository;
    private final CategoryRepository categoryRepository;
    private final TaxRepository taxRepository;

    @Override
    public void run(String... args) throws Exception {
        if (unitRepository.count() == 0) {
            initializeUnits();
        }
        
        if (categoryRepository.count() == 0) {
            initializeCategories();
        }
        
        if (taxRepository.count() == 0) {
            initializeTaxes();
        }
        
        log.info("Data initialization completed");
    }

    private void initializeUnits() {
        Unit kg = new Unit();
        kg.setUnitName("Kilograms");
        kg.setUnitCode("kg");
        unitRepository.save(kg);
        
        Unit pcs = new Unit();
        pcs.setUnitName("Pieces");
        pcs.setUnitCode("pcs");
        unitRepository.save(pcs);
        
        Unit l = new Unit();
        l.setUnitName("Liters");
        l.setUnitCode("l");
        unitRepository.save(l);
        
        Unit m = new Unit();
        m.setUnitName("Meters");
        m.setUnitCode("m");
        unitRepository.save(m);
        
        Unit box = new Unit();
        box.setUnitName("Boxes");
        box.setUnitCode("box");
        unitRepository.save(box);
        
        log.info("Units initialized");
    }

    private void initializeCategories() {
        Category rawMaterials = new Category();
        rawMaterials.setCategoryName("Raw Materials");
        rawMaterials.setDescription("Raw materials for production");
        categoryRepository.save(rawMaterials);
        
        Category finishedGoods = new Category();
        finishedGoods.setCategoryName("Finished Goods");
        finishedGoods.setDescription("Completed products ready for sale");
        categoryRepository.save(finishedGoods);
        
        Category packaging = new Category();
        packaging.setCategoryName("Packaging Materials");
        packaging.setDescription("Materials for packaging");
        categoryRepository.save(packaging);
        
        log.info("Categories initialized");
    }

    private void initializeTaxes() {
        Tax gst5 = new Tax();
        gst5.setTaxName("GST 5%");
        gst5.setTaxRate(new BigDecimal("5.00"));
        taxRepository.save(gst5);
        
        Tax gst12 = new Tax();
        gst12.setTaxName("GST 12%");
        gst12.setTaxRate(new BigDecimal("12.00"));
        taxRepository.save(gst12);
        
        Tax gst18 = new Tax();
        gst18.setTaxName("GST 18%");
        gst18.setTaxRate(new BigDecimal("18.00"));
        taxRepository.save(gst18);
        
        Tax noTax = new Tax();
        noTax.setTaxName("No Tax");
        noTax.setTaxRate(BigDecimal.ZERO);
        taxRepository.save(noTax);
        
        log.info("Taxes initialized");
    }
}
