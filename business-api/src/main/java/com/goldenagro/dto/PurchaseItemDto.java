package com.goldenagro.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseItemDto {
    @NotNull(message = "Raw material ID is required")
    private Integer rawMaterialId;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @NotNull(message = "Price is required")
    private BigDecimal price;
}
