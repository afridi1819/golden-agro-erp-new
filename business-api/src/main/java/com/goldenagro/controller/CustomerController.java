package com.goldenagro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.model.Customer;
import com.goldenagro.repository.CustomerRepository;
import com.goldenagro.service.ActivityLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final ActivityLogService activityLogService;

    private String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }

        String digits = phone.replaceAll("\\D", "");

        if (digits.isBlank()) {
            return "";
        }

        if (digits.length() != 10) {
            throw new IllegalArgumentException(
                    "Phone must be exactly 10 digits");
        }

        return digits;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAll() {
        try {

            return ResponseEntity.ok(
                    ApiResponse.success(
                            customerRepository.findAll()));

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error fetching customers: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Customer>>> getActive() {
        try {

            return ResponseEntity.ok(
                    ApiResponse.success(
                            customerRepository.findByStatus("active")));

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error fetching active customers: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> create(
            @RequestBody Customer customer) {

        try {

            customer.setPhone(
                    normalizePhone(customer.getPhone()));

            Customer savedCustomer =
                    customerRepository.save(customer);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "CUSTOMER",
                    "CREATE",
                    savedCustomer.getCustomerId().toString(),
                    "Created customer: "
                            + savedCustomer.getCustomerName(),
                    null,
                    savedCustomer.toString());

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Customer created",
                            savedCustomer));

        } catch (IllegalArgumentException e) {

            return ResponseEntity.ok(
                    ApiResponse.error(e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error creating customer: "
                                    + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> update(
            @PathVariable Integer id,
            @RequestBody Customer customer) {

        try {

            Customer existingCustomer =
                    customerRepository.findById(id)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "Customer not found"));

            String oldValues =
                    existingCustomer.toString();

            customer.setCustomerId(id);

            customer.setPhone(
                    normalizePhone(customer.getPhone()));

            Customer updatedCustomer =
                    customerRepository.save(customer);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "CUSTOMER",
                    "UPDATE",
                    updatedCustomer.getCustomerId().toString(),
                    "Updated customer: "
                            + updatedCustomer.getCustomerName(),
                    oldValues,
                    updatedCustomer.toString());

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Customer updated",
                            updatedCustomer));

        } catch (IllegalArgumentException e) {

            return ResponseEntity.ok(
                    ApiResponse.error(e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error updating customer: "
                                    + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id) {

        try {

            Customer customer =
                    customerRepository.findById(id)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "Customer not found"));

            String oldValues =
                    customer.toString();

            customer.setStatus("inactive");

            Customer updatedCustomer =
                    customerRepository.save(customer);

            activityLogService.log(
                    0,
                    "System",
                    "Admin",
                    "CUSTOMER",
                    "DELETE",
                    updatedCustomer.getCustomerId().toString(),
                    "Deleted customer: "
                            + updatedCustomer.getCustomerName(),
                    oldValues,
                    updatedCustomer.toString());

            return ResponseEntity.ok(
                    ApiResponse.success(null));

        } catch (Exception e) {

            System.err.println(
                    "Customer Delete Error: "
                            + e.getMessage());

            e.printStackTrace();

            return ResponseEntity.ok(
                    ApiResponse.error(
                            "Error deleting customer: "
                                    + e.getMessage()));
        }
    }
}