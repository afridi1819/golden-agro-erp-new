package com.goldenagro.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goldenagro.dto.ExpenseDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Expense;
import com.goldenagro.repository.ExpenseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ActivityLogService activityLogService;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(Integer id) {
        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Expense not found with id: " + id
                        )
                );
    }

    @Transactional
    public Expense createExpense(ExpenseDto dto) {

        Expense expense = new Expense();

        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());

        // Handle date parsing
        try {

            if (dto.getDate() != null && dto.getDate().length() == 10) {

                expense.setDate(
                        LocalDateTime.parse(
                                dto.getDate() + "T00:00:00",
                                DateTimeFormatter.ofPattern(
                                        "yyyy-MM-dd'T'HH:mm:ss"
                                )
                        )
                );

            } else if (dto.getDate() != null) {

                expense.setDate(
                        LocalDateTime.parse(dto.getDate())
                );

            } else {

                expense.setDate(LocalDateTime.now());
            }

        } catch (Exception e) {

            expense.setDate(LocalDateTime.now());
        }

        expense.setNotes(dto.getNotes());

        Expense savedExpense = expenseRepository.save(expense);

        // ACTIVITY LOG
        activityLogService.log(
                0,
                "System",
                "Admin",
                "EXPENSE",
                "CREATE",
                savedExpense.getExpenseId().toString(),
                "Created expense: " + savedExpense.getDescription(),
                null,
                "Description: " + savedExpense.getDescription()
                        + ", Amount: " + savedExpense.getAmount()
                        + ", Category: " + savedExpense.getCategory()
        );

        return savedExpense;
    }

    @Transactional
    public Expense updateExpense(Integer id, ExpenseDto dto) {

        Expense expense = getExpenseById(id);

        // Store old values before updating
        String oldValues =
                "Description: " + expense.getDescription()
                        + ", Amount: " + expense.getAmount()
                        + ", Category: " + expense.getCategory()
                        + ", Notes: " + expense.getNotes();

        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());

        // Handle date parsing
        try {

            if (dto.getDate() != null && dto.getDate().length() == 10) {

                expense.setDate(
                        LocalDateTime.parse(
                                dto.getDate() + "T00:00:00",
                                DateTimeFormatter.ofPattern(
                                        "yyyy-MM-dd'T'HH:mm:ss"
                                )
                        )
                );

            } else if (dto.getDate() != null) {

                expense.setDate(
                        LocalDateTime.parse(dto.getDate())
                );

            } else {

                expense.setDate(LocalDateTime.now());
            }

        } catch (Exception e) {

            expense.setDate(LocalDateTime.now());
        }

        expense.setNotes(dto.getNotes());

        Expense savedExpense = expenseRepository.save(expense);

        String newValues =
                "Description: " + savedExpense.getDescription()
                        + ", Amount: " + savedExpense.getAmount()
                        + ", Category: " + savedExpense.getCategory()
                        + ", Notes: " + savedExpense.getNotes();

        // ACTIVITY LOG
        activityLogService.log(
                0,
                "System",
                "Admin",
                "EXPENSE",
                "UPDATE",
                savedExpense.getExpenseId().toString(),
                "Updated expense: " + savedExpense.getDescription(),
                oldValues,
                newValues
        );

        return savedExpense;
    }

    @Transactional
    public void deleteExpense(Integer id) {

        Expense expense = getExpenseById(id);

        // Store details before deleting
        String oldValues =
                "Description: " + expense.getDescription()
                        + ", Amount: " + expense.getAmount()
                        + ", Category: " + expense.getCategory()
                        + ", Notes: " + expense.getNotes();

        String description = expense.getDescription();

        expenseRepository.delete(expense);

        // ACTIVITY LOG
        activityLogService.log(
                0,
                "System",
                "Admin",
                "EXPENSE",
                "DELETE",
                id.toString(),
                "Deleted expense: " + description,
                oldValues,
                null
        );
    }

    public List<Object[]> getExpenseBreakdown() {
        return expenseRepository.getExpenseBreakdownByCategory();
    }
}