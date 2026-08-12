package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "retailers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Retailer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer retailerId;

    @Column(name = "shop_name", length = 200, nullable = false)
    private String shopName;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "gst_number", length = 50)
    private String gstNumber;

    @Column(name = "auth_user_id", length = 100)
    private String authUserId;

    @Column(name = "status", columnDefinition = "ENUM('active', 'inactive') DEFAULT 'active'")
    private String status = "active";

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}