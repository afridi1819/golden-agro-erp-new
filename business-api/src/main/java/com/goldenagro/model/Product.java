package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer productId;

    @Column(name = "product_name", length = 200, nullable = false)
    private String productName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal costPrice;

    @ManyToOne
    @JoinColumn(name = "tax_id")
    private Tax tax;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @Column(name = "status", columnDefinition = "ENUM('active', 'inactive') DEFAULT 'active'")
    private String status = "active";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}