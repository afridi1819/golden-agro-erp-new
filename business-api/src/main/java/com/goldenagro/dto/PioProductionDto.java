package com.goldenagro.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PioProductionDto {

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotNull(message = "Production boxes is required")
    @Min(value = 0, message = "Production boxes cannot be negative")
    private Integer productionBoxes = 0;

    private String notes;
}