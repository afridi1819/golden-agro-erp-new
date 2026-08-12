package com.goldenagro.service;

import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Invoice;
import com.goldenagro.model.RetailerOrder;
import com.goldenagro.repository.InvoiceRepository;
import com.goldenagro.repository.RetailerOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final RetailerOrderRepository orderRepository;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Integer id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    public List<Invoice> getInvoicesByRetailer(Integer retailerId) {
        return invoiceRepository.findByRetailerRetailerId(retailerId);
    }

    public Invoice createInvoiceFromOrder(Integer orderId) {
        RetailerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setRetailer(order.getRetailer());
        invoice.setOrder(order);
        invoice.setTotalAmount(order.getTotalAmount());
        
        // Calculate tax (assuming 18% GST)
        BigDecimal taxAmount = order.getTotalAmount().multiply(BigDecimal.valueOf(0.18));
        invoice.setTaxAmount(taxAmount);
        invoice.setStatus("unpaid");

        return invoiceRepository.save(invoice);
    }

    private String generateInvoiceNumber() {
        String prefix = "INV";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp;
    }
}