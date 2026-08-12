package com.goldenagro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductDto {
    @NotBlank(message = "Product name is required")
    private String productName;
    
    @NotNull(message = "Selling price is required")
    private BigDecimal sellingPrice;
    
    private BigDecimal costPrice;
    private Integer taxId;
    private Integer categoryId;
    private Integer unitId;
    private String status = "active";
}
