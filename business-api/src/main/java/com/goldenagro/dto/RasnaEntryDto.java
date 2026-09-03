package com.goldenagro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RasnaEntryDto {

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotNull(message = "Customer is required")
    private Integer customerId;

    @NotNull(message = "Filled crates sold is required")
    @Min(value = 0, message = "Filled crates sold cannot be negative")
    private Integer filledCratesSold = 0;

    @NotNull(message = "Empty crates returned is required")
    @Min(value = 0, message = "Empty crates returned cannot be negative")
    private Integer emptyCratesReturned = 0;

    @NotNull(message = "Broken bottles is required")
    @Min(value = 0, message = "Broken bottles cannot be negative")
    private Integer brokenBottles = 0;

    private String brokenBottlePaymentStatus;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity = 0;

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Rate cannot be negative")
    private BigDecimal rate = BigDecimal.ZERO;

    private String notes;

    private BigDecimal totalAmount;
}