package com.goldenagro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.NotificationResponseDto;
import com.goldenagro.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /*
     * =========================
     * PIO INDIVIDUAL SALE
     * =========================
     */

    @PostMapping("/pio-sale/{saleId}")
    public ResponseEntity<NotificationResponseDto> sendPioSaleNotification(
            @PathVariable Integer saleId) {

        NotificationResponseDto response = notificationService.sendPioSaleNotification(saleId);

        return ResponseEntity.ok(response);
    }

    /*
     * =========================
     * RASNA INDIVIDUAL ENTRY
     * =========================
     */

    @PostMapping("/rasna-entry/{entryId}")
    public ResponseEntity<NotificationResponseDto> sendRasnaEntryNotification(
            @PathVariable Integer entryId) {

        NotificationResponseDto response = notificationService.sendRasnaEntryNotification(entryId);

        return ResponseEntity.ok(response);
    }

    /*
     * =========================
     * RASNA CUSTOMER SUMMARY
     * =========================
     */

    @PostMapping("/rasna-customer/{customerId}/summary")
    public ResponseEntity<NotificationResponseDto> sendRasnaCustomerSummary(
            @PathVariable Integer customerId,
            @RequestParam String season) {

        NotificationResponseDto response = notificationService.sendRasnaCustomerSummary(
                customerId,
                season);

        return ResponseEntity.ok(response);
    }

    /*
     * =========================
     * PIO CUSTOMER SUMMARY
     * =========================
     */

    @PostMapping("/pio-customer/{customerId}/summary")
    public ResponseEntity<NotificationResponseDto> sendPioCustomerSummary(
            @PathVariable Integer customerId,
            @RequestParam String season) {

        NotificationResponseDto response = notificationService.sendPioCustomerSummary(
                customerId,
                season);

        return ResponseEntity.ok(response);
    }

}