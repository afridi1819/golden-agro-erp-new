package com.goldenagro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;

    @Column(name = "category_name", length = 100, nullable = false, unique = true)
    private String categoryName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}