package com.goldenagro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.goldenagro.model.ActivityLog;

public interface ActivityLogRepository
                extends JpaRepository<ActivityLog, Integer> {

        List<ActivityLog> findAllByOrderByCreatedAtDesc();

        List<ActivityLog> findByModuleNameOrderByCreatedAtDesc(
                        String moduleName);

        List<ActivityLog> findByActionTypeOrderByCreatedAtDesc(
                        String actionType);

        List<ActivityLog> findByModuleNameAndActionTypeOrderByCreatedAtDesc(
                        String moduleName,
                        String actionType);
}