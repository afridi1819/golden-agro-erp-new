package com.goldenagro.service;

import com.goldenagro.dto.OrderDto;
import com.goldenagro.dto.OrderItemDto;
import com.goldenagro.exception.BadRequestException;
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
public class OrderService {
    private final RetailerOrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final ProductRepository productRepository;
    private final FinishedGoodsStockRepository fgStockRepository;

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
        return orderRepository.save(order);
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
        return orderRepository.save(order);
    }

    public RetailerOrder updateOrderStatus(Integer orderId, String status) {
        RetailerOrder order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
}