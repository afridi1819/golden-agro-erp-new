package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "production_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductionOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer productionOrderId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "retailer_order_id")
    private RetailerOrder retailerOrder;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 20, columnDefinition = "ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending'")
    private String status = "pending";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}