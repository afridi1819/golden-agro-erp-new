package com.goldenagro.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goldenagro.dto.ProductionOrderDto;
import com.goldenagro.exception.BadRequestException;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.BillOfMaterial;
import com.goldenagro.model.BomItem;
import com.goldenagro.model.FinishedGoodsStock;
import com.goldenagro.model.Product;
import com.goldenagro.model.ProductionOrder;
import com.goldenagro.model.RawMaterial;
import com.goldenagro.model.RetailerOrder;
import com.goldenagro.model.RetailerOrderItem;
import com.goldenagro.repository.BillOfMaterialRepository;
import com.goldenagro.repository.FinishedGoodsStockRepository;
import com.goldenagro.repository.ProductRepository;
import com.goldenagro.repository.ProductionOrderRepository;
import com.goldenagro.repository.RawMaterialRepository;
import com.goldenagro.repository.RetailerOrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductionService {

        private final ProductionOrderRepository productionOrderRepository;
        private final ProductRepository productRepository;
        private final BillOfMaterialRepository bomRepository;
        private final RawMaterialRepository rawMaterialRepository;
        private final FinishedGoodsStockRepository fgStockRepository;
        private final RetailerOrderRepository retailerOrderRepository;
        private final ActivityLogService activityLogService;

        public List<ProductionOrder> getAllProductionOrders() {
                return productionOrderRepository.findAll();
        }

        public ProductionOrder getProductionOrderById(Integer id) {
                return productionOrderRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Production order not found"));
        }
        @Transactional
        public ProductionOrder createProductionOrder(ProductionOrderDto dto) {
                Product product = productRepository.findById(dto.getProductId())
                                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                ProductionOrder order = new ProductionOrder();
                order.setProduct(product);
                order.setQuantity(dto.getQuantity());
                order.setStatus("pending");

                ProductionOrder saved = productionOrderRepository.save(order);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PRODUCTION",
                                "CREATE",
                                saved.getProductionOrderId().toString(),
                                "Created production order #" + saved.getProductionOrderId()
                                                + " for product: " + product.getProductName(),
                                null,
                                "productId=" + product.getProductId()
                                                + ", quantity=" + saved.getQuantity()
                                                + ", status=" + saved.getStatus());

                return saved;
        }

        @Transactional
        public ProductionOrder createProductionOrderFromRetailerOrder(Integer retailerOrderId) {
                RetailerOrder retailerOrder = retailerOrderRepository.findById(retailerOrderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Retailer order not found"));

                ProductionOrder productionOrder = new ProductionOrder();
                productionOrder.setRetailerOrder(retailerOrder);
                productionOrder.setStatus("pending");
                productionOrder.setNotes("Auto-created from retailer order #" + retailerOrderId);

                ProductionOrder saved = productionOrderRepository.save(productionOrder);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PRODUCTION",
                                "CREATE",
                                saved.getProductionOrderId().toString(),
                                "Created production order from retailer order #"
                                                + retailerOrderId,
                                null,
                                "retailerOrderId=" + retailerOrderId
                                                + ", status=" + saved.getStatus());

                return saved;
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
                        productionOrder.setNotes("Auto-created from retailer order #" + retailerOrderId + " for "
                                        + item.getProduct().getProductName());

                        ProductionOrder saved = productionOrderRepository.save(productionOrder);

                        activityLogService.log(
                                        0,
                                        "System",
                                        "Admin",
                                        "PRODUCTION",
                                        "CREATE",
                                        saved.getProductionOrderId().toString(),
                                        "Auto-created production order for product: "
                                                        + item.getProduct().getProductName(),
                                        null,
                                        "productId=" + item.getProduct().getProductId()
                                                        + ", quantity=" + saved.getQuantity()
                                                        + ", retailerOrderId=" + retailerOrderId);

                        productionOrders.add(saved);
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
                BillOfMaterial bom = bomRepository
                                .findByProductProductIdAndIsActiveTrue(order.getProduct().getProductId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No active BOM found for this product"));

                // Check and deduct raw materials
                for (BomItem bomItem : bom.getItems()) {
                        BigDecimal requiredQty = bomItem.getQuantityRequired()
                                        .multiply(BigDecimal.valueOf(order.getQuantity()));
                        RawMaterial material = bomItem.getRawMaterial();

                        if (material.getStockQuantity() < requiredQty.intValue()) {
                                throw new BadRequestException(
                                                "Insufficient raw material: " + material.getMaterialName());
                        }

                        material.setStockQuantity(material.getStockQuantity() - requiredQty.intValue());
                        rawMaterialRepository.save(material);
                }

                order.setStatus("in_progress");

                ProductionOrder saved = productionOrderRepository.save(order);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PRODUCTION",
                                "START",
                                saved.getProductionOrderId().toString(),
                                "Started production order #"
                                                + saved.getProductionOrderId(),
                                "pending",
                                "in_progress");

                return saved;
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

                ProductionOrder saved = productionOrderRepository.save(order);

                activityLogService.log(
                                0,
                                "System",
                                "Admin",
                                "PRODUCTION",
                                "COMPLETE",
                                saved.getProductionOrderId().toString(),
                                "Completed production order #"
                                                + saved.getProductionOrderId(),
                                "in_progress",
                                "completed");

                return saved;
        }
}
