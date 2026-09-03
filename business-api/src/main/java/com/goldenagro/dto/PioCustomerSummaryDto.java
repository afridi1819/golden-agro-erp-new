package com.goldenagro.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PioCustomerSummaryDto {

    private Integer customerId;

    private String customerName;

    private String season;

    // Total transactions
    private Integer totalEntries;

    // Box summary
    private Integer totalBoxesSold;

    // Financial summary
    private BigDecimal totalSalesAmount;

    // All transactions for this customer
    private List<PioSaleDto> entries;
}