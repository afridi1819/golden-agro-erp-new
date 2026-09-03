package com.goldenagro.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RasnaCustomerSummaryDto {

    private Integer customerId;

    private String customerName;

    private String season;

    // Total transactions
    private Integer totalEntries;

    // Crate summary
    private Integer totalCratesSold;

    private Integer totalEmptyCratesReturned;

    // Bottle summary
    private Integer totalBrokenBottles;

    // Financial summary
    private BigDecimal totalSalesAmount;

    private Integer paidBrokenBottleCount;

    private Integer unpaidBrokenBottleCount;

    // All transactions for this customer
    private List<RasnaEntryDto> entries;
}