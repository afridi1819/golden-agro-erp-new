package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invoiceId;

    @Column(name = "invoice_number", unique = true, nullable = false, length = 50)
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "retailer_order_id", nullable = false)
    private RetailerOrder order;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

    @Column(name = "invoice_date")
    private java.time.LocalDateTime invoiceDate = java.time.LocalDateTime.now();

    @Column(precision = 12, scale = 2, nullable = false)
    private java.math.BigDecimal subtotal;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    private java.math.BigDecimal taxAmount = java.math.BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private java.math.BigDecimal totalAmount;

    @Column(length = 20, columnDefinition = "ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft'")
    private String status = "draft";

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}