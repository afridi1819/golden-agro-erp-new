package com.goldenagro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.ActivityLog;
import com.goldenagro.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

        private final ActivityLogRepository activityLogRepository;

        @GetMapping
        public ResponseEntity<ApiResponse<List<ActivityLog>>> getAllLogs(
                        @RequestParam(required = false) String module,
                        @RequestParam(required = false) String action) {

                List<ActivityLog> logs;

                if (module != null && !module.isBlank()
                                && action != null && !action.isBlank()) {

                        logs = activityLogRepository
                                        .findByModuleNameAndActionTypeOrderByCreatedAtDesc(
                                                        module,
                                                        action);

                } else if (module != null && !module.isBlank()) {

                        logs = activityLogRepository
                                        .findByModuleNameOrderByCreatedAtDesc(module);

                } else if (action != null && !action.isBlank()) {

                        logs = activityLogRepository
                                        .findByActionTypeOrderByCreatedAtDesc(action);

                } else {

                        logs = activityLogRepository
                                        .findAllByOrderByCreatedAtDesc();
                }

                return ResponseEntity.ok(ApiResponse.success(logs));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ActivityLog>> getLogById(
                        @PathVariable Integer id) {

                ActivityLog log = activityLogRepository
                                .findById(id)
                                .orElse(null);

                return ResponseEntity.ok(ApiResponse.success(log));
        }
}