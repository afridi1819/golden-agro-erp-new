package com.goldenagro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name", length = 200)
    private String userName;

    @Column(name = "user_role", length = 100)
    private String userRole;

    @Column(name = "module_name", length = 100)
    private String moduleName;

    @Column(name = "action_type", length = 100)
    private String actionType;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(name = "old_values", columnDefinition = "LONGTEXT")
    private String oldValues;

    @Lob
    @Column(name = "new_values", columnDefinition = "LONGTEXT")
    private String newValues;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}