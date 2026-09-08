package com.goldenagro.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goldenagro.dto.PurchaseDto;
import com.goldenagro.dto.PurchaseItemDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Expense;
import com.goldenagro.model.Purchase;
import com.goldenagro.model.PurchaseItem;
import com.goldenagro.model.RawMaterial;
import com.goldenagro.model.Supplier;
import com.goldenagro.repository.ExpenseRepository;
import com.goldenagro.repository.PurchaseRepository;
import com.goldenagro.repository.RawMaterialRepository;
import com.goldenagro.repository.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseService {

        private final PurchaseRepository purchaseRepository;
        private final SupplierRepository supplierRepository;
        private final RawMaterialRepository rawMaterialRepository;
        private final ExpenseRepository expenseRepository;
        private final ActivityLogService activityLogService;

        public List<Purchase> getAllPurchases() {
                return purchaseRepository.findAll();
        }

        public Purchase getPurchaseById(Integer id) {

                return purchaseRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Purchase not found with id: " + id));
        }

        @Transactional
        public Purchase createPurchase(PurchaseDto dto) {

                Supplier supplier = supplierRepository
                                .findById(dto.getSupplierId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Supplier not found with id: "
                                                                + dto.getSupplierId()));

                Purchase purchase = new Purchase();

                purchase.setSupplier(supplier);
                purchase.setStatus("pending");
                purchase.setPurchaseDate(LocalDateTime.now());

                BigDecimal total = BigDecimal.ZERO;

                for (PurchaseItemDto itemDto : dto.getItems()) {

                        RawMaterial rawMaterial = rawMaterialRepository
                                        .findById(itemDto.getRawMaterialId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Raw material not found with id: "
                                                                        + itemDto.getRawMaterialId()));

                        PurchaseItem item = new PurchaseItem();

                        item.setPurchase(purchase);
                        item.setRawMaterial(rawMaterial);
                        item.setQuantity(itemDto.getQuantity());
                        item.setPricePerUnit(itemDto.getPrice());

                        BigDecimal itemTotal = itemDto.getPrice()
                                        .multiply(
                                                        BigDecimal.valueOf(
                                                                        itemDto.getQuantity()));

                        item.setTotalPrice(itemTotal);

                        purchase.getItems().add(item);

                        total = total.add(itemTotal);
                }

                purchase.setTotalAmount(total);

                Purchase savedPurchase = purchaseRepository.save(purchase);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PURCHASE",
                                "CREATE",
                                savedPurchase.getPurchaseId().toString(),
                                "Created purchase #"
                                                + savedPurchase.getPurchaseId(),
                                null,
                                purchaseLogString(savedPurchase));

                return savedPurchase;
        }

        @Transactional
        public Purchase updatePurchase(
                        Integer purchaseId,
                        PurchaseDto dto) {

                Purchase purchase = purchaseRepository.findById(purchaseId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Purchase not found with id: "
                                                                + purchaseId));

                if (!"pending".equalsIgnoreCase(
                                purchase.getStatus())) {

                        throw new IllegalStateException(
                                        "Only pending purchases can be edited");
                }

                String oldValues = purchaseLogString(purchase);

                Supplier supplier = supplierRepository
                                .findById(dto.getSupplierId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Supplier not found with id: "
                                                                + dto.getSupplierId()));

                purchase.setSupplier(supplier);

                /*
                 * Remove existing items.
                 *
                 * orphanRemoval = true in Purchase entity will
                 * automatically delete the old purchase_items.
                 */

                purchase.getItems().clear();

                /*
                 * Force Hibernate to process the removal of old items.
                 *
                 * This helps prevent issues when old items and new
                 * items are replaced in the same transaction.
                 */

                purchaseRepository.saveAndFlush(purchase);

                BigDecimal total = BigDecimal.ZERO;

                List<PurchaseItem> newItems = new ArrayList<>();

                for (PurchaseItemDto itemDto : dto.getItems()) {

                        RawMaterial rawMaterial = rawMaterialRepository
                                        .findById(
                                                        itemDto.getRawMaterialId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Raw material not found with id: "
                                                                        + itemDto.getRawMaterialId()));

                        PurchaseItem item = new PurchaseItem();

                        item.setPurchase(purchase);
                        item.setRawMaterial(rawMaterial);
                        item.setQuantity(itemDto.getQuantity());
                        item.setPricePerUnit(itemDto.getPrice());

                        BigDecimal itemTotal = itemDto.getPrice()
                                        .multiply(
                                                        BigDecimal.valueOf(
                                                                        itemDto.getQuantity()));

                        item.setTotalPrice(itemTotal);

                        newItems.add(item);

                        total = total.add(itemTotal);
                }

                purchase.getItems().addAll(newItems);

                purchase.setTotalAmount(total);

                Purchase saved = purchaseRepository.saveAndFlush(purchase);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PURCHASE",
                                "UPDATE",
                                saved.getPurchaseId().toString(),
                                "Updated purchase #"
                                                + saved.getPurchaseId(),
                                oldValues,
                                purchaseLogString(saved));

                return saved;
        }

        @Transactional
        public Purchase completePurchase(
                        Integer purchaseId) {

                Purchase purchase = getPurchaseById(purchaseId);

                if ("completed".equalsIgnoreCase(
                                purchase.getStatus())) {

                        return purchase;
                }

                if ("cancelled".equalsIgnoreCase(
                                purchase.getStatus())) {

                        throw new IllegalStateException(
                                        "Cancelled purchase cannot be completed");
                }

                String oldValues = purchaseLogString(purchase);

                for (PurchaseItem item : purchase.getItems()) {

                        RawMaterial material = item.getRawMaterial();

                        Integer currentStock = material.getStockQuantity();

                        if (currentStock == null) {
                                currentStock = 0;
                        }

                        Integer purchasedQuantity = item.getQuantity();

                        if (purchasedQuantity == null) {
                                purchasedQuantity = 0;
                        }

                        material.setStockQuantity(
                                        currentStock
                                                        + purchasedQuantity);

                        rawMaterialRepository.save(material);
                }

                purchase.setStatus("completed");

                Purchase saved = purchaseRepository.saveAndFlush(
                                purchase);

                Expense expense = new Expense();

                expense.setDescription(
                                "Raw material purchase from "
                                                + (saved.getSupplier() != null
                                                                ? saved.getSupplier()
                                                                                .getSupplierName()
                                                                : "Supplier")
                                                + " (Purchase #"
                                                + saved.getPurchaseId()
                                                + ")");

                expense.setAmount(
                                saved.getTotalAmount() != null
                                                ? saved.getTotalAmount()
                                                : BigDecimal.ZERO);

                expense.setCategory(
                                "Raw Materials");

                expense.setDate(
                                saved.getPurchaseDate() != null
                                                ? saved.getPurchaseDate()
                                                : LocalDateTime.now());

                expense.setNotes(
                                "Auto-created from Purchase #"
                                                + saved.getPurchaseId());

                expenseRepository.save(expense);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PURCHASE",
                                "COMPLETE",
                                saved.getPurchaseId().toString(),
                                "Completed purchase #"
                                                + saved.getPurchaseId(),
                                oldValues,
                                purchaseLogString(saved));

                return saved;
        }

        @Transactional
        public Purchase cancelPurchase(
                        Integer purchaseId) {

                Purchase purchase = getPurchaseById(purchaseId);

                if (!"pending".equalsIgnoreCase(
                                purchase.getStatus())) {

                        throw new IllegalStateException(
                                        "Only pending purchases can be cancelled");
                }

                String oldValues = purchaseLogString(purchase);

                purchase.setStatus("cancelled");

                Purchase saved = purchaseRepository.saveAndFlush(
                                purchase);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PURCHASE",
                                "CANCEL",
                                saved.getPurchaseId().toString(),
                                "Cancelled purchase #"
                                                + saved.getPurchaseId(),
                                oldValues,
                                purchaseLogString(saved));

                return saved;
        }

        private String purchaseLogString(
                        Purchase purchase) {

                if (purchase == null) {
                        return null;
                }

                StringBuilder builder = new StringBuilder();

                builder.append("{");

                builder.append(
                                "\"purchaseId\":").append(
                                                purchase.getPurchaseId());

                builder.append(
                                ", \"supplier\": \"").append(
                                                purchase.getSupplier() != null
                                                                ? purchase.getSupplier()
                                                                                .getSupplierName()
                                                                : "")
                                .append(
                                                "\"");

                builder.append(
                                ", \"status\": \"").append(
                                                purchase.getStatus())
                                .append(
                                                "\"");

                builder.append(
                                ", \"totalAmount\": \"").append(
                                                purchase.getTotalAmount())
                                .append(
                                                "\"");

                builder.append(
                                ", \"items\": [");

                if (purchase.getItems() != null) {

                        for (int i = 0; i < purchase.getItems().size(); i++) {

                                PurchaseItem item = purchase.getItems().get(i);

                                builder.append("{");

                                builder.append(
                                                "\"rawMaterial\": \"").append(
                                                                item.getRawMaterial() != null
                                                                                ? item.getRawMaterial()
                                                                                                .getMaterialName()
                                                                                : "")
                                                .append(
                                                                "\"");

                                builder.append(
                                                ", \"quantity\": ").append(
                                                                item.getQuantity());

                                builder.append(
                                                ", \"price\": \"").append(
                                                                item.getPricePerUnit())
                                                .append(
                                                                "\"");

                                builder.append("}");

                                if (i < purchase.getItems().size()
                                                - 1) {

                                        builder.append(",");
                                }
                        }
                }

                builder.append("]}");

                return builder.toString();
        }
}
