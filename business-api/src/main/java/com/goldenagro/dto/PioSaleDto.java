package com.goldenagro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PioSaleDto {

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotNull(message = "Customer is required")
    private Integer customerId;

    @NotNull(message = "Boxes sold is required")
    @Min(value = 0, message = "Boxes sold cannot be negative")
    private Integer boxesSold = 0;

    @NotNull(message = "Rate is required")
    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Rate cannot be negative")
    private BigDecimal rate = BigDecimal.ZERO;

    private String notes;

    private BigDecimal totalAmount;
}