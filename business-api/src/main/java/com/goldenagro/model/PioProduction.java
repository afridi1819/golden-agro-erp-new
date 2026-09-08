package com.goldenagro.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pio_productions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PioProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer pioProductionId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "season", length = 100, nullable = false)
    private String season;

    @Column(name = "production_boxes", nullable = false)
    private Integer productionBoxes = 0;

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