package com.goldenagro.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.goldenagro.dto.PioProductionDto;
import com.goldenagro.model.PioProduction;
import com.goldenagro.repository.PioProductionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PioProductionService {

    private final PioProductionRepository pioProductionRepository;
    private final ActivityLogService activityLogService;

    public List<PioProduction> getAllEntries() {
        return pioProductionRepository.findAll();
    }

    public PioProduction getEntryById(Integer id) {
        return pioProductionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PIO production entry not found"));
    }

    public PioProduction createEntry(PioProductionDto dto) {

        PioProduction entry = new PioProduction();

        applyDtoToEntry(entry, dto);

        PioProduction savedEntry = pioProductionRepository.save(entry);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "PIO",
                "CREATE",
                savedEntry.getPioProductionId().toString(),
                "Created PIO production entry of "
                        + savedEntry.getProductionBoxes()
                        + " boxes",
                null,
                savedEntry.toString());

        return savedEntry;
    }

    public PioProduction updateEntry(
            Integer id,
            PioProductionDto dto) {

        PioProduction existingEntry = getEntryById(id);

        String oldValues = existingEntry.toString();

        applyDtoToEntry(existingEntry, dto);

        PioProduction updatedEntry = pioProductionRepository.save(existingEntry);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "PIO",
                "UPDATE",
                updatedEntry.getPioProductionId().toString(),
                "Updated PIO production entry #"
                        + updatedEntry.getPioProductionId(),
                oldValues,
                updatedEntry.toString());

        return updatedEntry;
    }

    public void deleteEntry(Integer id) {

        PioProduction entry = getEntryById(id);

        String oldValues = entry.toString();

        pioProductionRepository.delete(entry);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "PIO",
                "DELETE",
                id.toString(),
                "Deleted PIO production entry #"
                        + id,
                oldValues,
                null);
    }

    private void applyDtoToEntry(
            PioProduction entry,
            PioProductionDto dto) {

        entry.setEntryDate(dto.getEntryDate());

        entry.setSeason(
                String.valueOf(
                        dto.getEntryDate().getYear()));

        entry.setProductionBoxes(
                dto.getProductionBoxes());

        entry.setNotes(dto.getNotes());
    }
}