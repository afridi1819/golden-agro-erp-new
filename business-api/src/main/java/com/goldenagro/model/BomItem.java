package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "bom_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BomItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bomItemId;

    @ManyToOne
    @JoinColumn(name = "bom_id", nullable = false)
    private BillOfMaterial bom;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(precision = 10, scale = 2)
    private BigDecimal quantityRequired;
}