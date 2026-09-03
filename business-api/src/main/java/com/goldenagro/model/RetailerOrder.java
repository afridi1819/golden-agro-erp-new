package com.goldenagro.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "retailer_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"items"})
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
