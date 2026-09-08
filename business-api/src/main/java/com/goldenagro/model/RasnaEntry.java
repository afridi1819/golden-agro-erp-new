package com.goldenagro.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rasna_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RasnaEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rasnaEntryId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "season", length = 100, nullable = false)
    private String season;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "filled_crates_sold", nullable = false)
    private Integer filledCratesSold = 0;

    @Column(name = "empty_crates_returned", nullable = false)
    private Integer emptyCratesReturned = 0;

    @Column(name = "broken_bottles", nullable = false)
    private Integer brokenBottles = 0;

    @Column(length = 10)
    private String brokenBottlePaymentStatus = "unpaid";

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

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