package com.goldenagro.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductionOrderDto {
    @NotNull(message = "Product ID is required")
    private Integer productId;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
}