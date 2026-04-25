package com.autobody.pos;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PosSessionRepository extends JpaRepository<PosSession, Long> {
    Optional<PosSession> findByUserIdAndClosedAtIsNull(Long userId);
}
