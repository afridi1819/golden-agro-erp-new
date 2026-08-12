package com.goldenagro.repository;

import com.goldenagro.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByRetailerRetailerId(Integer retailerId);
    List<Invoice> findByStatus(String status);
}