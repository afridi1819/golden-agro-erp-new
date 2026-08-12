package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.Invoice;
import com.goldenagro.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Invoice>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Invoice>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<ApiResponse<List<Invoice>>> getByRetailer(@PathVariable Integer retailerId) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoicesByRetailer(retailerId)));
    }

    @PostMapping("/from-order/{orderId}")
    public ResponseEntity<ApiResponse<Invoice>> createFromOrder(@PathVariable Integer orderId) {
        return ResponseEntity.ok(ApiResponse.success("Invoice created", invoiceService.createInvoiceFromOrder(orderId)));
    }
}