package com.goldenagro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "retailer_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetailerOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderItemId;

    @ManyToOne
    @JoinColumn(name = "retailer_order_id", nullable = false)
    @JsonBackReference
    private RetailerOrder order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;
}