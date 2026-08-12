package com.goldenagro.service;

import com.goldenagro.dto.ExpenseDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Expense;
import com.goldenagro.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(Integer id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    @Transactional
    public Expense createExpense(ExpenseDto dto) {
        Expense expense = new Expense();
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());
        
        // Handle date parsing - frontend sends yyyy-MM-dd format
        try {
            if (dto.getDate().length() == 10) {
                // Date only format (yyyy-MM-dd)
                expense.setDate(LocalDateTime.parse(dto.getDate() + "T00:00:00", 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")));
            } else {
                // Full datetime format
                expense.setDate(LocalDateTime.parse(dto.getDate(), DATE_FORMATTER));
            }
        } catch (Exception e) {
            // Fallback to current date if parsing fails
            expense.setDate(LocalDateTime.now());
        }
        
        expense.setNotes(dto.getNotes());
        
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(Integer id, ExpenseDto dto) {
        Expense expense = getExpenseById(id);
        
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());
        
        // Handle date parsing - frontend sends yyyy-MM-dd format
        try {
            if (dto.getDate().length() == 10) {
                // Date only format (yyyy-MM-dd)
                expense.setDate(LocalDateTime.parse(dto.getDate() + "T00:00:00", 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")));
            } else {
                // Full datetime format
                expense.setDate(LocalDateTime.parse(dto.getDate(), DATE_FORMATTER));
            }
        } catch (Exception e) {
            // Fallback to current date if parsing fails
            expense.setDate(LocalDateTime.now());
        }
        
        expense.setNotes(dto.getNotes());
        
        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Integer id) {
        Expense expense = getExpenseById(id);
        expenseRepository.delete(expense);
    }

    public List<Object[]> getExpenseBreakdown() {
        return expenseRepository.getExpenseBreakdownByCategory();
    }
}
