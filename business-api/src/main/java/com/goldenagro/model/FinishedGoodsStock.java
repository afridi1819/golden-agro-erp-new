package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "finished_goods_stock", uniqueConstraints = {
    @UniqueConstraint(columnNames = "product_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinishedGoodsStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer fgId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "batch_no", length = 50)
    private String batchNo;

    @Column(name = "last_updated")
    private java.time.LocalDateTime lastUpdated = java.time.LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        lastUpdated = java.time.LocalDateTime.now();
    }
}