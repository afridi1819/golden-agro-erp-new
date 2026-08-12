package com.goldenagro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseDto {
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    private String category;
    
    @NotNull(message = "Date is required")
    private String date;
    
    private String notes;
}
