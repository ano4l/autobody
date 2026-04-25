package com.autobody.inventory.part;

import com.autobody.inventory.part.dto.PartDTO;
import com.autobody.inventory.part.dto.StockCheckResponse;
import org.mapstruct.Mapper;

@Mapper
public interface PartMapper {

    default PartDTO toDto(Part p) {
        if (p == null) return null;
        return new PartDTO(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getCategory(),
                p.getMake(),
                p.getModel(),
                p.getYearRangeStart(),
                p.getYearRangeEnd(),
                p.getQtyOnHand(),
                p.getLowStockThreshold(),
                p.getCostPrice(),
                p.getSellPrice(),
                p.getLocation(),
                p.getSupplier() != null ? p.getSupplier().getId() : null,
                p.getSupplier() != null ? p.getSupplier().getName() : null,
                p.getShopifyProductId(),
                p.getShopifyVariantId(),
                Boolean.TRUE.equals(p.getActive()),
                p.isLowStock(),
                p.getVersion(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    default StockCheckResponse toStockCheck(Part p) {
        if (p == null) return null;
        return new StockCheckResponse(
                p.getSku(),
                p.getName(),
                p.getQtyOnHand() != null && p.getQtyOnHand() > 0,
                p.getQtyOnHand() != null ? p.getQtyOnHand() : 0,
                p.isLowStock(),
                p.getSellPrice(),
                p.getLocation()
        );
    }
}
