package com.goldenagro.service;

import com.goldenagro.dto.ProductionOrderDto;
import com.goldenagro.exception.BadRequestException;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.*;
import com.goldenagro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionService {
    private final ProductionOrderRepository productionOrderRepository;
    private final ProductRepository productRepository;
    private final BillOfMaterialRepository bomRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final FinishedGoodsStockRepository fgStockRepository;
    private final RetailerOrderRepository retailerOrderRepository;

    public List<ProductionOrder> getAllProductionOrders() {
        return productionOrderRepository.findAll();
    }

    public ProductionOrder getProductionOrderById(Integer id) {
        return productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production order not found"));
    }

    public ProductionOrder createProductionOrder(ProductionOrderDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductionOrder order = new ProductionOrder();
        order.setProduct(product);
        order.setQuantity(dto.getQuantity());
        order.setStatus("pending");

        return productionOrderRepository.save(order);
    }

    @Transactional
    public ProductionOrder createProductionOrderFromRetailerOrder(Integer retailerOrderId) {
        RetailerOrder retailerOrder = retailerOrderRepository.findById(retailerOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer order not found"));

        ProductionOrder productionOrder = new ProductionOrder();
        productionOrder.setRetailerOrder(retailerOrder);
        productionOrder.setStatus("pending");
        productionOrder.setNotes("Auto-created from retailer order #" + retailerOrderId);

        return productionOrderRepository.save(productionOrder);
    }

    @Transactional
    public List<ProductionOrder> createProductionOrdersFromRetailerOrder(Integer retailerOrderId) {
        RetailerOrder retailerOrder = retailerOrderRepository.findById(retailerOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer order not found"));

        List<ProductionOrder> productionOrders = new ArrayList<>();

        for (RetailerOrderItem item : retailerOrder.getItems()) {
            ProductionOrder productionOrder = new ProductionOrder();
            productionOrder.setProduct(item.getProduct());
            productionOrder.setQuantity(item.getQuantity());
            productionOrder.setRetailerOrder(retailerOrder);
            productionOrder.setStatus("pending");
            productionOrder.setNotes("Auto-created from retailer order #" + retailerOrderId + " for " + item.getProduct().getProductName());

            productionOrders.add(productionOrderRepository.save(productionOrder));
        }

        return productionOrders;
    }

    @Transactional
    public ProductionOrder startProduction(Integer orderId) {
        ProductionOrder order = getProductionOrderById(orderId);

        if (!order.getStatus().equals("pending")) {
            throw new BadRequestException("Production order is not in pending status");
        }

        // Get BOM for the product
        BillOfMaterial bom = bomRepository.findByProductProductIdAndIsActiveTrue(order.getProduct().getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No active BOM found for this product"));

        // Check and deduct raw materials
        for (BomItem bomItem : bom.getItems()) {
            BigDecimal requiredQty = bomItem.getQuantityRequired().multiply(BigDecimal.valueOf(order.getQuantity()));
            RawMaterial material = bomItem.getRawMaterial();

            if (material.getStockQuantity() < requiredQty.intValue()) {
                throw new BadRequestException("Insufficient raw material: " + material.getMaterialName());
            }

            material.setStockQuantity(material.getStockQuantity() - requiredQty.intValue());
            rawMaterialRepository.save(material);
        }

        order.setStatus("in_progress");
        return productionOrderRepository.save(order);
    }

    @Transactional
    public ProductionOrder completeProduction(Integer orderId) {
        ProductionOrder order = getProductionOrderById(orderId);

        if (!order.getStatus().equals("in_progress")) {
            throw new BadRequestException("Production order is not in progress");
        }

        // Add to finished goods stock
        FinishedGoodsStock fgStock = fgStockRepository.findByProductProductId(order.getProduct().getProductId())
                .orElse(new FinishedGoodsStock());

        fgStock.setProduct(order.getProduct());
        fgStock.setQuantity((fgStock.getQuantity() != null ? fgStock.getQuantity() : 0) + order.getQuantity());
        fgStockRepository.save(fgStock);

        order.setStatus("completed");
        order.setCompletedAt(LocalDateTime.now());
        return productionOrderRepository.save(order);
    }
}