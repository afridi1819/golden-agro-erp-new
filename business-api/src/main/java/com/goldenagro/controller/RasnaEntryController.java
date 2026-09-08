package com.goldenagro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.RasnaCustomerSummaryDto;
import com.goldenagro.dto.RasnaEntryDto;
import com.goldenagro.model.RasnaEntry;
import com.goldenagro.service.RasnaEntryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rasna-entries")
@RequiredArgsConstructor
public class RasnaEntryController {

        private final RasnaEntryService rasnaEntryService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<RasnaEntry>>> getAllEntries() {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                rasnaEntryService.getAllEntries()));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<RasnaEntry>> getEntryById(
                        @PathVariable Integer id) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                rasnaEntryService.getEntryById(id)));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<RasnaEntry>> createEntry(
                        @Valid @RequestBody RasnaEntryDto dto) {

                RasnaEntry entry = rasnaEntryService.createEntry(dto);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Rasna entry created successfully",
                                                entry));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<RasnaEntry>> updateEntry(
                        @PathVariable Integer id,
                        @Valid @RequestBody RasnaEntryDto dto) {

                RasnaEntry entry = rasnaEntryService.updateEntry(id, dto);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Rasna entry updated successfully",
                                                entry));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteEntry(
                        @PathVariable Integer id) {

                rasnaEntryService.deleteEntry(id);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Rasna entry deleted successfully",
                                                null));
        }

        @GetMapping("/customer/{customerId}/summary")
        public ResponseEntity<ApiResponse<RasnaCustomerSummaryDto>> getCustomerSummary(
                        @PathVariable Integer customerId) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                rasnaEntryService
                                                                .getCustomerSummary(customerId)));
        }
}