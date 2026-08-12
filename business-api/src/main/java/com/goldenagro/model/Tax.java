package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "taxes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tax {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taxId;

    @Column(name = "tax_name", length = 100, nullable = false)
    private String taxName;

    @Column(name = "tax_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal taxRate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}