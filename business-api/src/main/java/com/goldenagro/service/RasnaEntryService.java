package com.goldenagro.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.goldenagro.dto.RasnaEntryDto;
import com.goldenagro.model.Customer;
import com.goldenagro.model.RasnaEntry;
import com.goldenagro.repository.CustomerRepository;
import com.goldenagro.repository.RasnaEntryRepository;
import com.goldenagro.dto.RasnaCustomerSummaryDto;
import java.time.Year;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RasnaEntryService {

        private final RasnaEntryRepository rasnaEntryRepository;
        private final CustomerRepository customerRepository;
        private final ActivityLogService activityLogService;

        public List<RasnaEntry> getAllEntries() {
                return rasnaEntryRepository.findAll();
        }

        public RasnaEntry getEntryById(Integer id) {
                return rasnaEntryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Rasna entry not found"));
        }

        public RasnaEntry createEntry(RasnaEntryDto dto) {

                Customer customer = customerRepository.findById(dto.getCustomerId())
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                RasnaEntry entry = new RasnaEntry();

                applyDtoToEntry(entry, dto, customer);

                RasnaEntry savedEntry = rasnaEntryRepository.save(entry);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "RASNA",
                                "CREATE",
                                savedEntry.getRasnaEntryId().toString(),
                                "Created Rasna entry for " + customer.getCustomerName(),
                                null,
                                savedEntry.toString());

                return savedEntry;
        }

        public RasnaEntry updateEntry(
                        Integer id,
                        RasnaEntryDto dto) {

                RasnaEntry existingEntry = getEntryById(id);

                String oldValues = existingEntry.toString();

                Customer customer = customerRepository
                                .findById(dto.getCustomerId())
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                applyDtoToEntry(
                                existingEntry,
                                dto,
                                customer);

                RasnaEntry updatedEntry = rasnaEntryRepository.save(existingEntry);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "RASNA",
                                "UPDATE",
                                updatedEntry.getRasnaEntryId().toString(),
                                "Updated Rasna entry #" +
                                                updatedEntry.getRasnaEntryId(),
                                oldValues,
                                updatedEntry.toString());

                return updatedEntry;
        }

        public void deleteEntry(Integer id) {

                RasnaEntry entry = getEntryById(id);

                String oldValues = entry.toString();

                rasnaEntryRepository.delete(entry);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "RASNA",
                                "DELETE",
                                id.toString(),
                                "Deleted Rasna entry #" + id,
                                oldValues,
                                null);
        }

        private void applyDtoToEntry(
                        RasnaEntry entry,
                        RasnaEntryDto dto,
                        Customer customer) {

                entry.setEntryDate(dto.getEntryDate());
                entry.setSeason(
                                String.valueOf(dto.getEntryDate().getYear()));
                entry.setCustomer(customer);

                entry.setFilledCratesSold(dto.getFilledCratesSold());
                entry.setEmptyCratesReturned(dto.getEmptyCratesReturned());
                entry.setBrokenBottles(dto.getBrokenBottles());
                entry.setBrokenBottlePaymentStatus(
                                dto.getBrokenBottlePaymentStatus() == null
                                                ? "unpaid"
                                                : dto.getBrokenBottlePaymentStatus());

                entry.setRate(dto.getRate());

                // Total Amount = Filled Crates Sold × Rate
                BigDecimal totalAmount = dto.getRate().multiply(
                                BigDecimal.valueOf(dto.getFilledCratesSold()));

                entry.setTotalAmount(totalAmount);

                entry.setNotes(dto.getNotes());
        }

        public RasnaCustomerSummaryDto getCustomerSummary(Integer customerId) {

                Customer customer = customerRepository.findById(customerId)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                String currentSeason = String.valueOf(Year.now().getValue());

                List<RasnaEntry> entries = rasnaEntryRepository
                                .findByCustomerCustomerIdAndSeason(
                                                customerId,
                                                currentSeason);

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

                int paidBrokenBottleCount = entries.stream()
                                .filter(entry -> "paid".equalsIgnoreCase(
                                                entry.getBrokenBottlePaymentStatus()))
                                .mapToInt(entry -> entry.getBrokenBottles() != null
                                                ? entry.getBrokenBottles()
                                                : 0)
                                .sum();

                int unpaidBrokenBottleCount = entries.stream()
                                .filter(entry -> !"paid".equalsIgnoreCase(
                                                entry.getBrokenBottlePaymentStatus()))
                                .mapToInt(entry -> entry.getBrokenBottles() != null
                                                ? entry.getBrokenBottles()
                                                : 0)
                                .sum();

                BigDecimal totalSalesAmount = entries.stream()
                                .map(entry -> entry.getTotalAmount() != null
                                                ? entry.getTotalAmount()
                                                : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                List<RasnaEntryDto> entryDtos = entries.stream()
                                .map(entry -> {

                                        RasnaEntryDto dto = new RasnaEntryDto();

                                        dto.setEntryDate(entry.getEntryDate());
                                        dto.setCustomerId(customer.getCustomerId());
                                        dto.setFilledCratesSold(
                                                        entry.getFilledCratesSold());
                                        dto.setEmptyCratesReturned(
                                                        entry.getEmptyCratesReturned());
                                        dto.setBrokenBottles(
                                                        entry.getBrokenBottles());
                                        dto.setBrokenBottlePaymentStatus(
                                                        entry.getBrokenBottlePaymentStatus());

                                        dto.setQuantity(
                                                        entry.getFilledCratesSold());

                                        dto.setRate(entry.getRate());
                                        dto.setTotalAmount(entry.getTotalAmount());
                                        dto.setNotes(entry.getNotes());

                                        return dto;
                                })
                                .collect(Collectors.toList());

                return new RasnaCustomerSummaryDto(
                                customer.getCustomerId(),
                                customer.getCustomerName(),
                                currentSeason,
                                entries.size(),
                                totalCratesSold,
                                totalEmptyCratesReturned,
                                totalBrokenBottles,
                                totalSalesAmount,
                                paidBrokenBottleCount,
                                unpaidBrokenBottleCount,
                                entryDtos);
        }

}