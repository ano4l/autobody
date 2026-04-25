package com.autobody.user;

import com.autobody.security.Role;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.shared.exception.ResourceNotFoundException;
import com.autobody.user.dto.CreateUserRequest;
import com.autobody.user.dto.UpdateUserRequest;
import com.autobody.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserDTO> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    @Transactional(readOnly = true)
    public UserDTO get(Long id) {
        return userMapper.toDto(findEntity(id));
    }

    @Transactional(readOnly = true)
    public UserDTO getByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDTO create(CreateUserRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new BusinessRuleException("EMAIL_TAKEN", "Email already registered: " + req.email());
        }
        User user = User.builder()
                .name(req.name())
                .email(req.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(req.role())
                .active(true)
                .build();
        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserDTO update(Long id, UpdateUserRequest req) {
        User user = findEntity(id);
        if (req.name() != null) user.setName(req.name());
        if (req.role() != null) user.setRole(req.role());
        if (req.active() != null) user.setActive(req.active());
        if (req.password() != null && !req.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        return userMapper.toDto(userRepository.save(user));
    }

    User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public Role roleOf(Long id) {
        return findEntity(id).getRole();
    }
}
