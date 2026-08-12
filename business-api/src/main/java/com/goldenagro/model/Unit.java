package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "units")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer unitId;

    @Column(name = "unit_name", length = 50, nullable = false)
    private String unitName;

    @Column(name = "unit_code", length = 10, nullable = false, unique = true)
    private String unitCode;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}