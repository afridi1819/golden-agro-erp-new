package com.goldenagro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.goldenagro.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    List<Customer> findByStatus(String status);

}