package com.goldenagro.service;

import org.springframework.stereotype.Service;

import com.goldenagro.model.ActivityLog;
import com.goldenagro.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void log(
            Integer userId,
            String userName,
            String userRole,
            String moduleName,
            String actionType,
            String entityId,
            String description,
            String oldValues,
            String newValues
    ) {

        try {

            ActivityLog log = new ActivityLog();

            log.setUserId(userId);
            log.setUserName(userName);
            log.setUserRole(userRole);

            log.setModuleName(moduleName);
            log.setActionType(actionType);

            log.setEntityId(entityId);

            log.setDescription(description);

            log.setOldValues(oldValues);
            log.setNewValues(newValues);

            activityLogRepository.save(log);

        } catch (Exception ex) {

            System.err.println(
                    "Activity Log Error: " + ex.getMessage()
            );

        }
    }
}