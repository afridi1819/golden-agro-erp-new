package com.goldenagro.service;

import com.goldenagro.dto.RetailerDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.Retailer;
import com.goldenagro.repository.RetailerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RetailerService {
    private final RetailerRepository retailerRepository;

    public List<Retailer> getAllRetailers() {
        return retailerRepository.findAll();
    }

    public List<Retailer> getActiveRetailers() {
        return retailerRepository.findByStatus("active");
    }

    public Retailer getRetailerById(Integer id) {
        return retailerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + id));
    }

    public Retailer getRetailerByIdOrNull(Integer id) {
        return retailerRepository.findById(id).orElse(null);
    }

    public Retailer getRetailerByAuthUserId(String authUserId) {
        return retailerRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found"));
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

        return retailerRepository.save(retailer);
    }

    @Transactional
    public Retailer createRetailerFromNet(Retailer retailer) {
        // For .NET integration - retailer already has retailerId set
        return retailerRepository.save(retailer);
    }

    public Retailer updateRetailer(Integer id, RetailerDto dto) {
        Retailer retailer = getRetailerById(id);
        retailer.setShopName(dto.getShopName());
        retailer.setOwnerName(dto.getOwnerName());
        retailer.setPhone(dto.getPhone());
        retailer.setEmail(dto.getEmail());
        retailer.setAddress(dto.getAddress());
        retailer.setGstNumber(dto.getGstNumber());
        retailer.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");
        return retailerRepository.save(retailer);
    }

    public void deleteRetailer(Integer id) {
        Retailer retailer = getRetailerById(id);
        retailer.setStatus("inactive");
        retailerRepository.save(retailer);
    }
}