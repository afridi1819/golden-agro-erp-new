package com.goldenagro.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goldenagro.dto.RetailerDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Retailer;
import com.goldenagro.repository.RetailerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RetailerService {

    private final RetailerRepository retailerRepository;
    private final ActivityLogService activityLogService;

    public List<Retailer> getAllRetailers() {
        return retailerRepository.findAll();
    }

    public List<Retailer> getActiveRetailers() {
        return retailerRepository.findByStatus("active");
    }

    public Retailer getRetailerById(Integer id) {
        return retailerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Retailer not found with id: " + id));
    }

    public Retailer getRetailerByIdOrNull(Integer id) {
        return retailerRepository.findById(id).orElse(null);
    }

    public Retailer getRetailerByAuthUserId(String authUserId) {
        return retailerRepository.findByAuthUserId(authUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Retailer not found"));
    }

    @Transactional
    public Retailer createRetailer(RetailerDto dto) {

        Retailer retailer = new Retailer();
        retailer.setShopName(dto.getShopName());
        retailer.setOwnerName(dto.getOwnerName());
        retailer.setPhone(dto.getPhone());
        retailer.setEmail(dto.getEmail());
        retailer.setAddress(dto.getAddress());
        retailer.setGstNumber(dto.getGstNumber());
        retailer.setAuthUserId(dto.getAuthUserId());
        retailer.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");

        Retailer savedRetailer = retailerRepository.save(retailer);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "RETAILER",
                "CREATE",
                savedRetailer.getRetailerId().toString(),
                "Created retailer: " + savedRetailer.getShopName(),
                null,
                savedRetailer.toString()
        );

        return savedRetailer;
    }

    @Transactional
    public Retailer createRetailerFromNet(Retailer retailer) {

        Retailer savedRetailer = retailerRepository.save(retailer);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "RETAILER",
                "CREATE",
                savedRetailer.getRetailerId().toString(),
                "Created retailer from Auth Service: " + savedRetailer.getShopName(),
                null,
                savedRetailer.toString()
        );

        return savedRetailer;
    }

    @Transactional
    public Retailer updateRetailer(Integer id, RetailerDto dto) {

        Retailer retailer = getRetailerById(id);

        String oldValues = retailer.toString();

        retailer.setShopName(dto.getShopName());
        retailer.setOwnerName(dto.getOwnerName());
        retailer.setPhone(dto.getPhone());
        retailer.setEmail(dto.getEmail());
        retailer.setAddress(dto.getAddress());
        retailer.setGstNumber(dto.getGstNumber());
        retailer.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");

        Retailer updatedRetailer = retailerRepository.save(retailer);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "RETAILER",
                "UPDATE",
                updatedRetailer.getRetailerId().toString(),
                "Updated retailer: " + updatedRetailer.getShopName(),
                oldValues,
                updatedRetailer.toString()
        );

        return updatedRetailer;
    }

    @Transactional
    public void deleteRetailer(Integer id) {

        Retailer retailer = getRetailerById(id);

        String oldValues = retailer.toString();

        retailer.setStatus("inactive");

        Retailer savedRetailer = retailerRepository.save(retailer);

        activityLogService.log(
                0,
                "System",
                "Admin",
                "RETAILER",
                "DELETE",
                savedRetailer.getRetailerId().toString(),
                "Deactivated retailer: " + savedRetailer.getShopName(),
                oldValues,
                savedRetailer.toString()
        );
    }
}