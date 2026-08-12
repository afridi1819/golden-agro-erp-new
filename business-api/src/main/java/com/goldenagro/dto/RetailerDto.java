package com.goldenagro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RetailerDto {
    @NotBlank(message = "Shop name is required")
    private String shopName;
    
    private String ownerName;
    private String phone;
    private String email;
    private String address;
    private String gstNumber;
    private String authUserId;
    private String status = "active";
}