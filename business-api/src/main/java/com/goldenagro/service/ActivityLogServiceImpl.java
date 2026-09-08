package com.goldenagro.service;

import org.springframework.stereotype.Service;

import com.goldenagro.model.ActivityLog;
import com.goldenagro.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl
                implements ActivityLogService {

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
                        String newValues) {

                try {

                        ActivityLog activityLog = new ActivityLog();

                        activityLog.setUserId(userId);

                        activityLog.setUserName(userName);

                        activityLog.setUserRole(userRole);

                        activityLog.setModuleName(moduleName);

                        activityLog.setActionType(actionType);

                        activityLog.setEntityId(entityId);

                        activityLog.setDescription(description);

                        activityLog.setOldValues(oldValues);

                        activityLog.setNewValues(newValues);

                        activityLogRepository.save(
                                        activityLog);

                        System.out.println(
                                        "Activity log created successfully: "
                                                        + moduleName
                                                        + " - "
                                                        + actionType);

                } catch (Exception ex) {

                        System.err.println(
                                        "========================================");

                        System.err.println(
                                        "ACTIVITY LOG ERROR");

                        ex.printStackTrace();

                        System.err.println(
                                        "========================================");
                }
        }
}