package com.goldenagro.service;

import com.goldenagro.dto.PurchaseDto;
import com.goldenagro.dto.PurchaseItemDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.*;
import com.goldenagro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {
    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ExpenseRepository expenseRepository;

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Purchase getPurchaseById(Integer id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
    }

    @Transactional
    public Purchase createPurchase(PurchaseDto dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setStatus("pending");

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseItemDto itemDto : dto.getItems()) {
            RawMaterial rawMaterial = rawMaterialRepository.findById(itemDto.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw material not found: " + itemDto.getRawMaterialId()));

            PurchaseItem item = new PurchaseItem();
            item.setPurchase(purchase);
            item.setRawMaterial(rawMaterial);
            item.setQuantity(itemDto.getQuantity());
            item.setPricePerUnit(itemDto.getPrice());

            purchase.getItems().add(item);
            total = total.add(itemDto.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        purchase.setTotalAmount(total);
        return purchaseRepository.save(purchase);
    }

    @Transactional
    public Purchase completePurchase(Integer purchaseId) {
        Purchase purchase = getPurchaseById(purchaseId);

        // Idempotency guard
        if ("completed".equalsIgnoreCase(purchase.getStatus())) {
            return purchase;
        }

        // Update raw material stock
        for (PurchaseItem item : purchase.getItems()) {
            RawMaterial material = item.getRawMaterial();
            material.setStockQuantity(material.getStockQuantity() + item.getQuantity());
            rawMaterialRepository.save(material);
        }

        purchase.setStatus("completed");
        Purchase saved = purchaseRepository.save(purchase);

        // Auto-create an Expense entry for this purchase so it appears in Expenses & dashboards
        Expense expense = new Expense();
        expense.setDescription(
            "Raw material purchase from " +
            (saved.getSupplier() != null ? saved.getSupplier().getSupplierName() : "Supplier") +
            " (Purchase #" + saved.getPurchaseId() + ")"
        );
        expense.setAmount(saved.getTotalAmount() != null ? saved.getTotalAmount() : BigDecimal.ZERO);
        expense.setCategory("Raw Materials");
        expense.setDate(saved.getPurchaseDate() != null ? saved.getPurchaseDate() : LocalDateTime.now());
        expense.setNotes("Auto-created from Purchase #" + saved.getPurchaseId());
        expenseRepository.save(expense);

        return saved;
    }
}