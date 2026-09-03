package com.goldenagro.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goldenagro.dto.OrderDto;
import com.goldenagro.dto.OrderItemDto;
import com.goldenagro.exception.BadRequestException;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.FinishedGoodsStock;
import com.goldenagro.model.Product;
import com.goldenagro.model.Retailer;
import com.goldenagro.model.RetailerOrder;
import com.goldenagro.model.RetailerOrderItem;
import com.goldenagro.repository.FinishedGoodsStockRepository;
import com.goldenagro.repository.ProductRepository;
import com.goldenagro.repository.RetailerOrderRepository;
import com.goldenagro.repository.RetailerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final RetailerOrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final ProductRepository productRepository;
    private final FinishedGoodsStockRepository fgStockRepository;
    private final ActivityLogService activityLogService;

    public List<RetailerOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<RetailerOrder> getOrdersByRetailer(Integer retailerId) {
        return orderRepository.findByRetailerRetailerId(retailerId);
    }

    public RetailerOrder getOrderById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    @Transactional
    public RetailerOrder createOrder(OrderDto dto) {
        Retailer retailer = retailerRepository.findById(dto.getRetailerId()).orElse(null);

        System.out.println("Looking for retailer with ID: " + dto.getRetailerId());
        if (retailer != null) {
            System.out.println("Found existing retailer: " + retailer.getShopName());
        }

        // If retailer doesn't exist, create one automatically for retailer users
        if (retailer == null && dto.getRetailerId() != null && dto.getRetailerId() > 0) {
            System.out.println("Creating new retailer for ID: " + dto.getRetailerId());
            retailer = new Retailer();
            retailer.setRetailerId(dto.getRetailerId());
            retailer.setShopName("Retailer " + dto.getRetailerId());
            retailer.setOwnerName("Owner " + dto.getRetailerId());
            retailer.setPhone("0000000000");
            retailer.setEmail("retailer" + dto.getRetailerId() + "@example.com");
            retailer.setAddress("Default Address");
            retailer.setGstNumber("GST" + dto.getRetailerId());
            retailer.setStatus("active");
            retailer = retailerRepository.save(retailer);
            System.out.println("Created new retailer with ID: " + retailer.getRetailerId());
        }

        if (retailer == null) {
            throw new ResourceNotFoundException("Retailer not found with ID: " + dto.getRetailerId());
        }

        RetailerOrder order = new RetailerOrder();
        order.setRetailer(retailer);
        order.setStatus("pending");
        order.setOrderDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            RetailerOrderItem item = new RetailerOrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(itemDto.getPrice() != null ? itemDto.getPrice() : product.getSellingPrice());

            order.getItems().add(item);
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        order.setTotalAmount(total);

        RetailerOrder savedOrder = orderRepository.save(order);

        activityLogService.log(
                0,
                "System",
                "Retailer",
                "ORDER",
                "CREATE",
                savedOrder.getRetailerOrderId().toString(),
                "Created order #" + savedOrder.getRetailerOrderId(),
                null,
                "Order Total: " + savedOrder.getTotalAmount()
        );

        return savedOrder;
    }

    @Transactional
    public RetailerOrder confirmOrder(Integer orderId) {
        RetailerOrder order = getOrderById(orderId);

        if (!order.getStatus().equals("pending")) {
            throw new BadRequestException("Order is not in pending status");
        }

        // Check and deduct stock
        for (RetailerOrderItem item : order.getItems()) {
            FinishedGoodsStock stock = fgStockRepository.findByProductProductId(item.getProduct().getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found for product: " + item.getProduct().getProductName()));

            if (stock.getQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + item.getProduct().getProductName());
            }

            stock.setQuantity(stock.getQuantity() - item.getQuantity());
            fgStockRepository.save(stock);
        }

        order.setStatus("in_progress");

        RetailerOrder saved = orderRepository.save(order);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "ORDER",
                "CONFIRM",
                saved.getRetailerOrderId().toString(),
                "Confirmed order #" + saved.getRetailerOrderId(),
                "pending",
                "in_progress"
        );

        return saved;
    }

    @Transactional
    public RetailerOrder updateOrderStatus(Integer orderId, String status) {

        RetailerOrder order = getOrderById(orderId);

        String oldStatus = order.getStatus();

        order.setStatus(status);

        RetailerOrder saved = orderRepository.save(order);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "ORDER",
                "STATUS_CHANGE",
                saved.getRetailerOrderId().toString(),
                "Changed order #" + saved.getRetailerOrderId()
                + " from " + oldStatus + " to " + status,
                oldStatus,
                status
        );

        return saved;
    }
}
