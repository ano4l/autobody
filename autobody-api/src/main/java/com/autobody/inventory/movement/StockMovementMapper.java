package com.autobody.inventory.movement;

import com.autobody.inventory.movement.dto.StockMovementDTO;
import org.mapstruct.Mapper;

@Mapper
public interface StockMovementMapper {

    default StockMovementDTO toDto(StockMovement m) {
        if (m == null) return null;
        return new StockMovementDTO(
                m.getId(),
                m.getPart() != null ? m.getPart().getId() : null,
                m.getPart() != null ? m.getPart().getSku() : null,
                m.getPart() != null ? m.getPart().getName() : null,
                m.getMovementType(),
                m.getQty(),
                m.getReference(),
                m.getNotes(),
                m.getPerformedBy() != null ? m.getPerformedBy().getId() : null,
                m.getPerformedBy() != null ? m.getPerformedBy().getName() : null,
                m.getCreatedAt()
        );
    }
}
