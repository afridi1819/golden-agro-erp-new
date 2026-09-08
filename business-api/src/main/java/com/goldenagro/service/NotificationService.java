package com.goldenagro.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.goldenagro.dto.NotificationResponseDto;
import com.goldenagro.model.PioSale;
import com.goldenagro.model.RasnaEntry;
import com.goldenagro.repository.PioSaleRepository;
import com.goldenagro.repository.RasnaEntryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

        private final PioSaleRepository pioSaleRepository;
        private final RasnaEntryRepository rasnaEntryRepository;

        // =====================================================
        // PIO SALE NOTIFICATION
        // =====================================================

        public NotificationResponseDto sendPioSaleNotification(Integer saleId) {

                PioSale sale = pioSaleRepository
                                .findById(saleId)
                                .orElseThrow(() -> new RuntimeException("PIO sale not found"));

                String customerName = sale.getCustomer() != null
                                ? sale.getCustomer().getCustomerName()
                                : "Customer";

                return new NotificationResponseDto(
                                false,
                                false,
                                "Notification request received for "
                                                + customerName);
        }

        // =====================================================
        // RASNA INDIVIDUAL ENTRY NOTIFICATION
        // =====================================================

        public NotificationResponseDto sendRasnaEntryNotification(Integer entryId) {

                RasnaEntry entry = rasnaEntryRepository
                                .findById(entryId)
                                .orElseThrow(() -> new RuntimeException("Rasna entry not found"));

                String customerName = entry.getCustomer() != null
                                ? entry.getCustomer().getCustomerName()
                                : "Customer";

                return new NotificationResponseDto(
                                false,
                                false,
                                "Rasna notification request received for "
                                                + customerName);
        }

        // =====================================================
        // RASNA CUSTOMER SEASON SUMMARY NOTIFICATION
        // =====================================================

        public NotificationResponseDto sendRasnaCustomerSummary(
                        Integer customerId,
                        String season) {

                List<RasnaEntry> entries = rasnaEntryRepository
                                .findByCustomerCustomerIdAndSeason(
                                                customerId,
                                                season);

                if (entries.isEmpty()) {
                        throw new RuntimeException(
                                        "No Rasna entries found for the selected customer and season");
                }

                String customerName = entries.get(0).getCustomer() != null
                                ? entries.get(0)
                                                .getCustomer()
                                                .getCustomerName()
                                : "Customer";

                int totalCratesSold = entries.stream()
                                .mapToInt(entry -> entry.getFilledCratesSold() != null
                                                ? entry.getFilledCratesSold()
                                                : 0)
                                .sum();

                int totalEmptyCratesReturned = entries.stream()
                                .mapToInt(entry -> entry.getEmptyCratesReturned() != null
                                                ? entry.getEmptyCratesReturned()
                                                : 0)
                                .sum();

                int totalBrokenBottles = entries.stream()
                                .mapToInt(entry -> entry.getBrokenBottles() != null
                                                ? entry.getBrokenBottles()
                                                : 0)
                                .sum();

                int paidBrokenBottles = entries.stream()
                                .filter(entry -> "paid".equalsIgnoreCase(
                                                entry.getBrokenBottlePaymentStatus()))
                                .mapToInt(entry -> entry.getBrokenBottles() != null
                                                ? entry.getBrokenBottles()
                                                : 0)
                                .sum();

                int unpaidBrokenBottles = entries.stream()
                                .filter(entry -> !"paid".equalsIgnoreCase(
                                                entry.getBrokenBottlePaymentStatus()))
                                .mapToInt(entry -> entry.getBrokenBottles() != null
                                                ? entry.getBrokenBottles()
                                                : 0)
                                .sum();

                BigDecimal totalSales = entries.stream()
                                .map(entry -> entry.getTotalAmount() != null
                                                ? entry.getTotalAmount()
                                                : BigDecimal.ZERO)
                                .reduce(
                                                BigDecimal.ZERO,
                                                BigDecimal::add);

                String message = "Rasna season summary prepared for "
                                + customerName
                                + " | Season: " + season
                                + " | Crates Sold: " + totalCratesSold
                                + " | Empty Crates Returned: "
                                + totalEmptyCratesReturned
                                + " | Broken Bottles: "
                                + totalBrokenBottles
                                + " | Paid: "
                                + paidBrokenBottles
                                + " | Unpaid: "
                                + unpaidBrokenBottles
                                + " | Total Sales: Rs. "
                                + totalSales;

                // Temporary backend response.
                // Later this message will be sent through
                // SMS + WhatsApp.
                return new NotificationResponseDto(
                                false,
                                false,
                                message);
        }

        public NotificationResponseDto sendPioCustomerSummary(
                        Integer customerId,
                        String season) {

                PioSale sale = pioSaleRepository
                                .findAll()
                                .stream()
                                .filter(pioSale ->

                                pioSale.getCustomer() != null &&

                                                pioSale.getCustomer()
                                                                .getCustomerId()
                                                                .equals(customerId)

                                )
                                .filter(pioSale -> {

                                        if (season == null || season.isBlank() || season.equals("all")) {
                                                return true;
                                        }

                                        return season.equals(
                                                        String.valueOf(
                                                                        pioSale.getSeason()));

                                })
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "No PIO sales found for this customer and season"));

                String customerName = sale.getCustomer() != null
                                ? sale.getCustomer().getCustomerName()
                                : "Customer";

                return new NotificationResponseDto(
                                false,
                                false,
                                "PIO season " + season
                                                + " summary notification request received for "
                                                + customerName);
        }

}