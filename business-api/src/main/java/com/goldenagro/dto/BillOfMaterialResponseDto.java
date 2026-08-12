package com.goldenagro.dto;

import com.goldenagro.model.BomItem;
import com.goldenagro.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillOfMaterialResponseDto {
    private Integer bomId;
    private Product product;
    private String version;
    private Boolean isActive;
    private List<BomItem> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
