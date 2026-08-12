package com.goldenagro.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "retailer_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetailerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer retailerOrderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

    @Column
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(length = 20)
    private String status = "pending"; // pending, confirmed, shipped, delivered, cancelled

    @Column(precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<RetailerOrderItem> items = new ArrayList<>();
}
