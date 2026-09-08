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
import com.goldenagro.dto.PioProductionDto;
import com.goldenagro.model.PioProduction;
import com.goldenagro.service.PioProductionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pio-productions")
@RequiredArgsConstructor
public class PioProductionController {

    private final PioProductionService pioProductionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PioProduction>>> getAllEntries() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        pioProductionService.getAllEntries()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PioProduction>> getEntryById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        pioProductionService.getEntryById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PioProduction>> createEntry(
            @Valid @RequestBody PioProductionDto dto) {

        PioProduction entry = pioProductionService.createEntry(dto);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "PIO production entry created successfully",
                        entry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PioProduction>> updateEntry(
            @PathVariable Integer id,
            @Valid @RequestBody PioProductionDto dto) {

        PioProduction entry = pioProductionService.updateEntry(id, dto);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "PIO production entry updated successfully",
                        entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(
            @PathVariable Integer id) {

        pioProductionService.deleteEntry(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "PIO production entry deleted successfully",
                        null));
    }
}