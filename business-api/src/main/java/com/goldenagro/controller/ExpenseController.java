package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.ExpenseDto;
import com.goldenagro.model.Expense;
import com.goldenagro.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<List<Expense>>> getAllExpenses() {
        try {
            List<Expense> expenses = expenseService.getAllExpenses();
            System.out.println("Fetched " + expenses.size() + " expenses from database");
            return ResponseEntity.ok(ApiResponse.success(expenses));
        } catch (Exception e) {
            System.err.println("Error fetching expenses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.error("Error fetching expenses: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<Expense>> getExpenseById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(expenseService.getExpenseById(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching expense: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<Expense>> createExpense(@Valid @RequestBody ExpenseDto dto) {
        try {
            System.out.println("Creating expense: " + dto.getDescription() + " Amount: " + dto.getAmount());
            Expense expense = expenseService.createExpense(dto);
            System.out.println("Expense created successfully with ID: " + expense.getExpenseId());
            return ResponseEntity.ok(ApiResponse.success("Expense created", expense));
        } catch (Exception e) {
            System.err.println("Error creating expense: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.error("Error creating expense: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<Expense>> updateExpense(@PathVariable Integer id, @Valid @RequestBody ExpenseDto dto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Expense updated", expenseService.updateExpense(id, dto)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error updating expense: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Integer id) {
        try {
            expenseService.deleteExpense(id);
            return ResponseEntity.ok(ApiResponse.success("Expense deleted", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error deleting expense: " + e.getMessage()));
        }
    }

    @GetMapping("/breakdown")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANUFACTURER')")
    public ResponseEntity<ApiResponse<List<Object[]>>> getExpenseBreakdown() {
        try {
            return ResponseEntity.ok(ApiResponse.success(expenseService.getExpenseBreakdown()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching expense breakdown: " + e.getMessage()));
        }
    }
}
