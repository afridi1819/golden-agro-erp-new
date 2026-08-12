package com.goldenagro.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderDto {
    @NotNull(message = "Retailer ID is required")
    private Integer retailerId;
    
    @NotEmpty(message = "Order items are required")
    private List<OrderItemDto> items;
}