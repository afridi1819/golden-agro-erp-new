package com.goldenagro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getAllLogs() {
        try {
            return ResponseEntity.ok(
                    ApiResponse.success(
                            activityLogRepository.findAll()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error fetching activity logs: " + e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/{id}")
public ResponseEntity<ApiResponse<ActivityLog>> getLogById(
        @PathVariable Integer id) {

        try {

            ActivityLog log
                    = activityLogRepository.findById(id)
                            .orElse(null);

            return ResponseEntity.ok(
                    ApiResponse.success(log)
            );

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error fetching activity log: "
                            + e.getMessage()
                    )
            );
        }
    }
}
