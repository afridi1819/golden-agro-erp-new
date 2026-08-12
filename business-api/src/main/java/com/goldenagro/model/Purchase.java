package com.goldenagro.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer purchaseId;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "purchase_date")
    private java.time.LocalDateTime purchaseDate = java.time.LocalDateTime.now();

    @Column(precision = 12, scale = 2)
    private java.math.BigDecimal totalAmount;

    @Column(length = 20, columnDefinition = "ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending'")
    private String status = "pending";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<PurchaseItem> items = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}