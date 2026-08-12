package com.goldenagro.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PurchaseDto {
    @NotNull(message = "Supplier ID is required")
    private Integer supplierId;
    
    @NotEmpty(message = "Purchase items are required")
    private List<PurchaseItemDto> items;
}