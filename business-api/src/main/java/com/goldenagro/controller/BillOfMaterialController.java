package com.goldenagro.controller;

import com.goldenagro.dto.ApiResponse;
import com.goldenagro.dto.BillOfMaterialDto;
import com.goldenagro.dto.BillOfMaterialResponseDto;
import com.goldenagro.exception.ResourceNotFoundException;
import com.goldenagro.model.BillOfMaterial;
import com.goldenagro.model.BomItem;
import com.goldenagro.model.Product;
import com.goldenagro.model.RawMaterial;
import com.goldenagro.repository.BillOfMaterialRepository;
import com.goldenagro.repository.BomItemRepository;
import com.goldenagro.repository.ProductRepository;
import com.goldenagro.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bom")
@RequiredArgsConstructor
public class BillOfMaterialController {
    private final BillOfMaterialRepository bomRepository;
    private final BomItemRepository bomItemRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillOfMaterialResponseDto>>> getAll() {
        try {
            List<BillOfMaterial> boms = bomRepository.findAll();
            
            // Convert to response DTOs with items
            List<BillOfMaterialResponseDto> bomDtos = boms.stream().map(bom -> {
                List<BomItem> items = bomItemRepository.findByBom_BomId(bom.getBomId());
                BillOfMaterialResponseDto dto = new BillOfMaterialResponseDto();
                dto.setBomId(bom.getBomId());
                dto.setProduct(bom.getProduct());
                dto.setVersion(bom.getVersion());
                dto.setIsActive(bom.getIsActive());
                dto.setItems(items);
                dto.setCreatedAt(bom.getCreatedAt());
                dto.setUpdatedAt(bom.getUpdatedAt());
                return dto;
            }).toList();
            
            return ResponseEntity.ok(ApiResponse.success(bomDtos));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching BOMs: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillOfMaterial>> getById(@PathVariable Integer id) {
        try {
            BillOfMaterial bom = bomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));
            List<BomItem> items = bomItemRepository.findByBom_BomId(id);
            bom.setItems(items);
            return ResponseEntity.ok(ApiResponse.success(bom));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error fetching BOM: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BillOfMaterial>> create(@RequestBody BillOfMaterialDto dto) {
        try {
            // Validate product exists
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

            // Create BOM
            BillOfMaterial bom = new BillOfMaterial();
            bom.setProduct(product);
            bom.setVersion(dto.getVersion());
            bom.setIsActive(dto.getIsActive());
            
            BillOfMaterial savedBom = bomRepository.save(bom);

            // Save BOM items if provided
            if (dto.getItems() != null) {
                for (BillOfMaterialDto.BomItemDto itemDto : dto.getItems()) {
                    // Validate raw material exists
                    RawMaterial rawMaterial = rawMaterialRepository.findById(itemDto.getRawMaterialId())
                            .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + itemDto.getRawMaterialId()));
                    
                    BomItem item = new BomItem();
                    item.setBom(savedBom);
                    item.setRawMaterial(rawMaterial);
                    item.setQuantityRequired(itemDto.getQuantityRequired());
                    
                    bomItemRepository.save(item);
                }
            }

            return ResponseEntity.ok(ApiResponse.success("BOM created", savedBom));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error creating BOM: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<BillOfMaterial>> update(@PathVariable Integer id, @RequestBody BillOfMaterialDto dto) {
        try {
            BillOfMaterial existingBom = bomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));

            // Update basic fields
            existingBom.setVersion(dto.getVersion());
            existingBom.setIsActive(dto.getIsActive());
            
            if (dto.getProductId() != null) {
                Product product = productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
                existingBom.setProduct(product);
            }

            BillOfMaterial updatedBom = bomRepository.save(existingBom);

            // Update BOM items if provided
            if (dto.getItems() != null) {
                // Delete existing items
                bomItemRepository.deleteByBom_BomId(id);
                
                // Save new items
                for (BillOfMaterialDto.BomItemDto itemDto : dto.getItems()) {
                    if (itemDto.getRawMaterialId() != null) {
                        RawMaterial rawMaterial = rawMaterialRepository.findById(itemDto.getRawMaterialId())
                                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + itemDto.getRawMaterialId()));
                        
                        BomItem item = new BomItem();
                        item.setBom(updatedBom);
                        item.setRawMaterial(rawMaterial);
                        item.setQuantityRequired(itemDto.getQuantityRequired());
                        
                        bomItemRepository.save(item);
                    }
                }
            }

            return ResponseEntity.ok(ApiResponse.success("BOM updated", updatedBom));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error updating BOM: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            BillOfMaterial bom = bomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));
            
            // Delete BOM items first
            bomItemRepository.deleteByBom_BomId(id);
            
            // Delete BOM
            bomRepository.delete(bom);
            
            return ResponseEntity.ok(ApiResponse.success("BOM deleted", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error deleting BOM: " + e.getMessage()));
        }
    }
}
