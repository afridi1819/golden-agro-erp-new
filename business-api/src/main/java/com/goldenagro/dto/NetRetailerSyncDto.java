package com.goldenagro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NetRetailerSyncDto {
    @NotNull(message = "Retailer ID is required")
    private Integer retailerId;
    
    @NotBlank(message = "Shop name is required")
    private String shopName;
    
    @NotBlank(message = "Owner name is required")
    private String ownerName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    private String address;
    private String gstNumber;
    private String status = "active";
}
