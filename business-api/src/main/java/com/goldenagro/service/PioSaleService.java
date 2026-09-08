package com.goldenagro.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.goldenagro.dto.PioCustomerSummaryDto;
import com.goldenagro.dto.PioSaleDto;
import com.goldenagro.dto.PioStockSummaryDto;
import com.goldenagro.model.Customer;
import com.goldenagro.model.PioSale;
import com.goldenagro.repository.CustomerRepository;
import com.goldenagro.repository.PioProductionRepository;
import com.goldenagro.repository.PioSaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PioSaleService {

        private final PioSaleRepository pioSaleRepository;
        private final PioProductionRepository pioProductionRepository;
        private final CustomerRepository customerRepository;
        private final ActivityLogService activityLogService;

        public List<PioSale> getAllEntries() {
                return pioSaleRepository.findAll();
        }

        public PioSale getEntryById(Integer id) {
                return pioSaleRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("PIO sale entry not found"));
        }

        public PioSale createEntry(PioSaleDto dto) {

                Customer customer = customerRepository
                                .findById(dto.getCustomerId())
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                validateAvailableStock(
                                dto.getEntryDate(),
                                dto.getBoxesSold(),
                                null);

                PioSale entry = new PioSale();

                applyDtoToEntry(entry, dto, customer);

                PioSale savedEntry = pioSaleRepository.save(entry);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PIO",
                                "CREATE",
                                savedEntry.getPioSaleId().toString(),
                                "Created PIO sale entry for "
                                                + customer.getCustomerName()
                                                + " - "
                                                + savedEntry.getBoxesSold()
                                                + " boxes",
                                null,
                                savedEntry.toString());

                return savedEntry;
        }

        public PioSale updateEntry(
                        Integer id,
                        PioSaleDto dto) {

                PioSale existingEntry = getEntryById(id);

                String oldValues = existingEntry.toString();

                Customer customer = customerRepository
                                .findById(dto.getCustomerId())
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                validateAvailableStock(
                                dto.getEntryDate(),
                                dto.getBoxesSold(),
                                id);

                applyDtoToEntry(existingEntry, dto, customer);

                PioSale updatedEntry = pioSaleRepository.save(existingEntry);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PIO",
                                "UPDATE",
                                updatedEntry.getPioSaleId().toString(),
                                "Updated PIO sale entry #"
                                                + updatedEntry.getPioSaleId(),
                                oldValues,
                                updatedEntry.toString());

                return updatedEntry;
        }

        public void deleteEntry(Integer id) {

                PioSale entry = getEntryById(id);

                String oldValues = entry.toString();

                pioSaleRepository.delete(entry);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PIO",
                                "DELETE",
                                id.toString(),
                                "Deleted PIO sale entry #"
                                                + id,
                                oldValues,
                                null);
        }

        public PioStockSummaryDto getStockSummary() {

                int totalProduction = pioProductionRepository.findAll()
                                .stream()
                                .mapToInt(production -> production.getProductionBoxes() != null
                                                ? production.getProductionBoxes()
                                                : 0)
                                .sum();

                int totalBoxesSold = pioSaleRepository.findAll()
                                .stream()
                                .mapToInt(sale -> sale.getBoxesSold() != null
                                                ? sale.getBoxesSold()
                                                : 0)
                                .sum();

                int currentStock = totalProduction - totalBoxesSold;

                return new PioStockSummaryDto(
                                totalProduction,
                                totalBoxesSold,
                                currentStock);
        }

        public PioCustomerSummaryDto getCustomerSummary(
                        Integer customerId,
                        String season) {

                Customer customer = customerRepository
                                .findById(customerId)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                String selectedSeason = season;

                if (selectedSeason == null || selectedSeason.isBlank()) {
                        selectedSeason = String.valueOf(Year.now().getValue());
                }

                List<PioSale> entries;

                if ("ALL".equalsIgnoreCase(selectedSeason)) {

                        entries = pioSaleRepository
                                        .findByCustomerCustomerId(customerId);

                } else {

                        entries = pioSaleRepository
                                        .findByCustomerCustomerIdAndSeason(
                                                        customerId,
                                                        selectedSeason);
                }

                int totalBoxesSold = entries.stream()
                                .mapToInt(entry -> entry.getBoxesSold() != null
                                                ? entry.getBoxesSold()
                                                : 0)
                                .sum();

                BigDecimal totalSalesAmount = entries.stream()
                                .map(entry -> entry.getTotalAmount() != null
                                                ? entry.getTotalAmount()
                                                : BigDecimal.ZERO)
                                .reduce(
                                                BigDecimal.ZERO,
                                                BigDecimal::add);

                List<PioSaleDto> entryDtos = entries.stream()
                                .map(entry -> {

                                        PioSaleDto dto = new PioSaleDto();

                                        dto.setEntryDate(entry.getEntryDate());
                                        dto.setCustomerId(
                                                        entry.getCustomer()
                                                                        .getCustomerId());
                                        dto.setBoxesSold(
                                                        entry.getBoxesSold());
                                        dto.setRate(
                                                        entry.getRate());
                                        dto.setTotalAmount(
                                                        entry.getTotalAmount());
                                        dto.setNotes(
                                                        entry.getNotes());

                                        return dto;
                                })
                                .collect(Collectors.toList());

                return new PioCustomerSummaryDto(
                                customer.getCustomerId(),
                                customer.getCustomerName(),
                                selectedSeason,
                                entries.size(),
                                totalBoxesSold,
                                totalSalesAmount,
                                entryDtos);
        }

        private void applyDtoToEntry(
                        PioSale entry,
                        PioSaleDto dto,
                        Customer customer) {

                entry.setEntryDate(dto.getEntryDate());

                entry.setSeason(
                                String.valueOf(
                                                dto.getEntryDate().getYear()));

                entry.setCustomer(customer);

                entry.setBoxesSold(dto.getBoxesSold());

                entry.setRate(dto.getRate());

                BigDecimal totalAmount = dto.getRate().multiply(
                                BigDecimal.valueOf(
                                                dto.getBoxesSold()));

                entry.setTotalAmount(totalAmount);

                entry.setNotes(dto.getNotes());
        }

        private void validateAvailableStock(
                        LocalDate entryDate,
                        Integer requestedBoxes,
                        Integer excludedSaleId) {

                int totalProduction = pioProductionRepository
                                .findByEntryDateLessThanEqual(entryDate)
                                .stream()
                                .mapToInt(production -> production.getProductionBoxes() != null
                                                ? production.getProductionBoxes()
                                                : 0)
                                .sum();

                int totalSales = pioSaleRepository
                                .findByEntryDateLessThanEqual(entryDate)
                                .stream()
                                .filter(sale -> excludedSaleId == null
                                                || !sale.getPioSaleId()
                                                                .equals(excludedSaleId))
                                .mapToInt(sale -> sale.getBoxesSold() != null
                                                ? sale.getBoxesSold()
                                                : 0)
                                .sum();

                int availableStock = totalProduction - totalSales;

                if (requestedBoxes > availableStock) {

                        throw new RuntimeException(
                                        "Insufficient PIO stock. Available stock: "
                                                        + availableStock
                                                        + " boxes, requested: "
                                                        + requestedBoxes
                                                        + " boxes");
                }
        }
}