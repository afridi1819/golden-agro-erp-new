package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "raw_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RawMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rawMaterialId;

    @Column(name = "material_name", length = 200, nullable = false)
    private String materialName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;

    @Column(name = "cost_per_unit", precision = 10, scale = 2)
    private java.math.BigDecimal costPerUnit = java.math.BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

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