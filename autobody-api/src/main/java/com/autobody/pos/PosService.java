package com.autobody.pos;

import com.autobody.pos.dto.ClosePosSessionRequest;
import com.autobody.pos.dto.OpenPosSessionRequest;
import com.autobody.pos.dto.PosSessionDTO;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.shared.exception.ResourceNotFoundException;
import com.autobody.user.User;
import com.autobody.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PosService {
    private final PosSessionRepository posSessionRepository;
    private final UserRepository userRepository;
    private final PosMapper posMapper;

    @Transactional(readOnly = true)
    public PosSessionDTO active(Long userId) {
        PosSession session = posSessionRepository.findByUserIdAndClosedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Active POS session for user", userId));
        return posMapper.toDto(session);
    }

    @Transactional
    public PosSessionDTO open(Long userId, OpenPosSessionRequest req) {
        if (posSessionRepository.findByUserIdAndClosedAtIsNull(userId).isPresent()) {
            throw new BusinessRuleException("POS_SESSION_OPEN", "User already has an open POS session");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        PosSession session = posSessionRepository.save(PosSession.builder()
                .user(user)
                .openedAt(Instant.now())
                .openingFloat(req.openingFloat() != null ? req.openingFloat() : BigDecimal.ZERO)
                .notes(req.notes())
                .build());
        return posMapper.toDto(session);
    }

    @Transactional
    public PosSessionDTO close(Long userId, ClosePosSessionRequest req) {
        PosSession session = posSessionRepository.findByUserIdAndClosedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Active POS session for user", userId));
        session.setClosedAt(Instant.now());
        session.setClosingFloat(req.closingFloat());
        if (req.notes() != null) session.setNotes(req.notes());
        return posMapper.toDto(posSessionRepository.save(session));
    }
}
