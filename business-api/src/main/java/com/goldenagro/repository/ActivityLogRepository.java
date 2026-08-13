package com.goldenagro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.goldenagro.model.ActivityLog;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Integer> {
}