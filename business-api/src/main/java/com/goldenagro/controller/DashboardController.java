package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.*;
import com.goldenagro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final RetailerOrderRepository orderRepository;
    private final PurchaseRepository purchaseRepository;
    private final FinishedGoodsStockRepository finishedGoodsStockRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRepository productRepository;
    private final ExpenseRepository expenseRepository;

    // Overall dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        // Total Sales (this month)
        List<RetailerOrder> monthOrders = orderRepository.findByOrderDateBetween(startOfMonth, now);
        BigDecimal totalSales = monthOrders.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()))
                .map(RetailerOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Total Purchases (this month)
        List<Purchase> monthPurchases = purchaseRepository.findByPurchaseDateBetween(startOfMonth, now);
        BigDecimal totalPurchases = monthPurchases.stream()
                .filter(p -> "completed".equalsIgnoreCase(p.getStatus()))
                .map(Purchase::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Total Expenses (this month)
        List<Expense> monthExpenses = expenseRepository.findAll().stream()
                .filter(e -> e.getDate() != null && 
                           !e.getDate().isBefore(startOfMonth) && 
                           !e.getDate().isAfter(now))
                .collect(Collectors.toList());
        BigDecimal totalExpenses = monthExpenses.stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Profit/Loss = Sales - Expenses (Purchases are also recorded as Expenses when completed)
        BigDecimal profitLoss = totalSales.subtract(totalExpenses);
        
        // Pending orders count (all time, not just this month)
        long pendingOrdersCount = orderRepository.findByStatus("pending").size();
        
        stats.put("totalSales", totalSales);
        stats.put("totalPurchases", totalPurchases);
        stats.put("totalExpenses", totalExpenses);
        stats.put("profitLoss", profitLoss);
        stats.put("orderCount", monthOrders.size());
        stats.put("pendingOrdersCount", pendingOrdersCount);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Monthly sales trend (last 6 months)
    @GetMapping("/sales-trend")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSalesTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDateTime start = month.atDay(1).atStartOfDay();
            LocalDateTime end = month.atEndOfMonth().atTime(23, 59, 59);
            
            List<RetailerOrder> orders = orderRepository.findByOrderDateBetween(start, end);
            BigDecimal sales = orders.stream()
                    .filter(o -> !"cancelled".equals(o.getStatus()))
                    .map(RetailerOrder::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> data = new HashMap<>();
            data.put("month", month.getMonth().toString().substring(0, 3));
            data.put("sales", sales);
            data.put("orders", orders.size());
            trend.add(data);
        }
        
        return ResponseEntity.ok(ApiResponse.success(trend));
    }

    // Profit/Loss trend (last 6 months)
    @GetMapping("/profit-trend")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProfitTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDateTime start = month.atDay(1).atStartOfDay();
            LocalDateTime end = month.atEndOfMonth().atTime(23, 59, 59);
            
            // Sales
            BigDecimal sales = orderRepository.findByOrderDateBetween(start, end).stream()
                    .filter(o -> !"cancelled".equals(o.getStatus()))
                    .map(RetailerOrder::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Purchases
            BigDecimal purchases = purchaseRepository.findByPurchaseDateBetween(start, end).stream()
                    .filter(p -> "completed".equalsIgnoreCase(p.getStatus()))
                    .map(Purchase::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Expenses
            BigDecimal expenses = expenseRepository.findAll().stream()
                    .filter(e -> e.getDate() != null && 
                               !e.getDate().isBefore(start) && 
                               !e.getDate().isAfter(end))
                    .map(Expense::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Profit = Revenue - Expenses (Purchases are also recorded as Expenses when completed)
            BigDecimal profit = sales.subtract(expenses);
            
            Map<String, Object> data = new HashMap<>();
            data.put("month", month.getMonth().toString().substring(0, 3));
            data.put("revenue", sales);
            data.put("purchases", purchases);
            data.put("expenses", expenses);
            data.put("profit", profit);
            trend.add(data);
        }
        
        return ResponseEntity.ok(ApiResponse.success(trend));
    }

    // Inventory levels (finished goods)
    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInventoryLevels() {
        List<FinishedGoodsStock> stocks = finishedGoodsStockRepository.findAll();
        
        List<Map<String, Object>> inventory = stocks.stream()
                .map(stock -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("product", stock.getProduct().getProductName());
                    data.put("quantity", stock.getQuantity());
                    data.put("batchNo", stock.getBatchNo());
                    return data;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(inventory));
    }

    // Raw materials inventory
    @GetMapping("/raw-materials-inventory")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRawMaterialsInventory() {
        List<RawMaterial> materials = rawMaterialRepository.findAll();
        
        List<Map<String, Object>> inventory = materials.stream()
                .map(material -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", material.getMaterialName());
                    data.put("quantity", material.getStockQuantity());
                    data.put("reorderLevel", material.getReorderLevel());
                    data.put("isLowStock", material.getStockQuantity() != null && 
                            material.getReorderLevel() != null && 
                            material.getStockQuantity().compareTo(material.getReorderLevel()) <= 0);
                    return data;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(inventory));
    }

    // Order status distribution
    @GetMapping("/order-status")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOrderStatusDistribution() {
        List<RetailerOrder> allOrders = orderRepository.findAll();
        
        Map<String, Long> statusCount = allOrders.stream()
                .collect(Collectors.groupingBy(RetailerOrder::getStatus, Collectors.counting()));
        
        List<Map<String, Object>> distribution = statusCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("status", entry.getKey());
                    data.put("count", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }

    // Top selling products
    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopSellingProducts() {
        List<RetailerOrder> orders = orderRepository.findAll();
        
        Map<String, Integer> productSales = new HashMap<>();
        
        orders.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()))
                .flatMap(order -> order.getItems().stream())
                .forEach(item -> {
                    String productName = item.getProduct().getProductName();
                    productSales.merge(productName, item.getQuantity(), Integer::sum);
                });
        
        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("product", entry.getKey());
                    data.put("quantity", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(topProducts));
    }

    // Expense breakdown by category
    @GetMapping("/expense-breakdown")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getExpenseBreakdown() {
        List<Expense> allExpenses = expenseRepository.findAll();
        
        Map<String, BigDecimal> categoryTotals = allExpenses.stream()
                .filter(e -> e.getAmount() != null)
                .collect(Collectors.groupingBy(
                    e -> e.getCategory() != null ? e.getCategory() : "Other",
                    Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
        
        List<Map<String, Object>> breakdown = categoryTotals.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("category", entry.getKey());
                    data.put("amount", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(breakdown));
    }
}
