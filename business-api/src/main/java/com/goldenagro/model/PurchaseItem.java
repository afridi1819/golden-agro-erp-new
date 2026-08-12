package com.goldenagro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer purchaseItemId;

    @ManyToOne
    @JoinColumn(name = "purchase_id", nullable = false)
    @JsonBackReference
    private Purchase purchase;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_per_unit", precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (totalPrice == null && pricePerUnit != null && quantity != null) {
            totalPrice = pricePerUnit.multiply(BigDecimal.valueOf(quantity));
        }
    }
}