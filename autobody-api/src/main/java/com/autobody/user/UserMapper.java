package com.autobody.user;

import com.autobody.user.dto.UserDTO;
import org.mapstruct.Mapper;

@Mapper
public interface UserMapper {

    default UserDTO toDto(User user) {
        if (user == null) return null;
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActive()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
