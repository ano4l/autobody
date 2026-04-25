package com.autobody.pos;

import com.autobody.pos.dto.PosSessionDTO;
import org.mapstruct.Mapper;

@Mapper
public interface PosMapper {
    default PosSessionDTO toDto(PosSession session) {
        return new PosSessionDTO(
                session.getId(),
                session.getUser().getId(),
                session.getUser().getName(),
                session.getOpenedAt(),
                session.getClosedAt(),
                session.getOpeningFloat(),
                session.getClosingFloat(),
                session.getNotes()
        );
    }
}
