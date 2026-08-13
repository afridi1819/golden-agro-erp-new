package com.goldenagro.service;

public interface ActivityLogService {

    void log(
            Integer userId,
            String userName,
            String userRole,
            String moduleName,
            String actionType,
            String entityId,
            String description,
            String oldValues,
            String newValues
    );
}