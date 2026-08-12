package com.goldenagro.repository;

import com.goldenagro.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    
    @Query("SELECT e FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate ORDER BY e.date DESC")
    List<Expense> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT e.category, SUM(e.amount) as total FROM Expense e GROUP BY e.category")
    List<Object[]> getExpenseBreakdownByCategory();
}
