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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.PioCustomerSummaryDto;
import com.goldenagro.dto.PioSaleDto;
import com.goldenagro.dto.PioStockSummaryDto;
import com.goldenagro.model.PioSale;
import com.goldenagro.service.PioSaleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pio-sales")
@RequiredArgsConstructor
public class PioSaleController {

        private final PioSaleService pioSaleService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<PioSale>>> getAllEntries() {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                pioSaleService.getAllEntries()));
        }

        @GetMapping("/stock-summary")
        public ResponseEntity<ApiResponse<PioStockSummaryDto>> getStockSummary() {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                pioSaleService.getStockSummary()));
        }

        @GetMapping("/customer/{customerId}/summary")
        public ResponseEntity<ApiResponse<PioCustomerSummaryDto>> getCustomerSummary(
                        @PathVariable Integer customerId,
                        @RequestParam(required = false) String season) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                pioSaleService.getCustomerSummary(
                                                                customerId,
                                                                season)));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<PioSale>> getEntryById(
                        @PathVariable Integer id) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                pioSaleService.getEntryById(id)));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<PioSale>> createEntry(
                        @Valid @RequestBody PioSaleDto dto) {

                PioSale entry = pioSaleService.createEntry(dto);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "PIO sale entry created successfully",
                                                entry));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<PioSale>> updateEntry(
                        @PathVariable Integer id,
                        @Valid @RequestBody PioSaleDto dto) {

                PioSale entry = pioSaleService.updateEntry(id, dto);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "PIO sale entry updated successfully",
                                                entry));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteEntry(
                        @PathVariable Integer id) {

                pioSaleService.deleteEntry(id);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "PIO sale entry deleted successfully",
                                                null));
        }
}