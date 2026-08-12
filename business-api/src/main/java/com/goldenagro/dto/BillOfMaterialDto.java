package com.goldenagro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class BillOfMaterialDto {
    @NotNull(message = "Product is required")
    private Integer productId;
    
    @NotBlank(message = "Version is required")
    private String version = "1.0";
    
    private Boolean isActive = true;
    
    private List<BomItemDto> items;
    
    @Data
    public static class BomItemDto {
        @NotNull(message = "Raw material is required")
        private Integer rawMaterialId;
        
        @NotNull(message = "Quantity is required")
        private BigDecimal quantityRequired;
    }
}
