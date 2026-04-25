package com.autobody.inventory.supplier;

import com.autobody.inventory.supplier.dto.SupplierDTO;
import org.mapstruct.Mapper;

@Mapper
public interface SupplierMapper {

    default SupplierDTO toDto(Supplier s) {
        if (s == null) return null;
        return new SupplierDTO(
                s.getId(),
                s.getName(),
                s.getContactName(),
                s.getPhone(),
                s.getEmail(),
                s.getLeadTimeDays(),
                s.getNotes(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
