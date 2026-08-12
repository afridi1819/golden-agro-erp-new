package com.goldenagro.controller;

import com.goldenagro.config.UserPrincipal;
import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.OrderDto;
import com.goldenagro.model.RetailerOrder;
import com.goldenagro.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<List<RetailerOrder>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders()));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<List<RetailerOrder>>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByRetailer(principal.getRetailerId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RetailerOrder>> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RetailerOrder>> createOrder(
            @Valid @RequestBody OrderDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            // For retailers, use retailer ID from JWT so order is accepted when frontend doesn't send it
            if (principal != null && "RETAILER".equals(principal.getRole())) {
                if (principal.getRetailerId() != null) {
                    dto.setRetailerId(principal.getRetailerId());
                } else if (dto.getRetailerId() == null || dto.getRetailerId() == 0) {
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Retailer account not linked. Please contact support."));
                }
            }
            
            System.out.println("Creating order for retailer ID: " + dto.getRetailerId() + " with " + dto.getItems().size() + " items");
            RetailerOrder order = orderService.createOrder(dto);
            System.out.println("Order created successfully with ID: " + order.getRetailerOrderId());
            return ResponseEntity.ok(ApiResponse.success("Order created", order));
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.error("Error creating order: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<RetailerOrder>> confirmOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Order is now in progress", orderService.confirmOrder(id)));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<RetailerOrder>> completeOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Order marked as completed", orderService.updateOrderStatus(id, "completed")));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<RetailerOrder>> updateOrderStatus(
            @PathVariable Integer id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", orderService.updateOrderStatus(id, status)));
    }
}