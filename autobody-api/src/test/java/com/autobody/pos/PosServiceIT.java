package com.autobody.pos;

import com.autobody.pos.dto.ClosePosSessionRequest;
import com.autobody.pos.dto.OpenPosSessionRequest;
import com.autobody.pos.dto.PosSessionDTO;
import com.autobody.security.Role;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.shared.exception.ResourceNotFoundException;
import com.autobody.support.AbstractPostgresIntegrationTest;
import com.autobody.user.User;
import com.autobody.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * POS session lifecycle: a cashier can only have one active session, open() is idempotent-hostile,
 * close() records the closing float, and an already-closed user has no active session to report.
 */
class PosServiceIT extends AbstractPostgresIntegrationTest {

    @Autowired private PosService posService;
    @Autowired private PosSessionRepository posSessionRepository;
    @Autowired private UserRepository userRepository;

    private User cashier;

    @BeforeEach
    void cleanSlate() {
        posSessionRepository.deleteAll();
        userRepository.findAll().stream()
                .filter(u -> u.getEmail().startsWith("pos-it-"))
                .forEach(userRepository::delete);
        cashier = userRepository.save(User.builder()
                .name("Till Operator")
                .email("pos-it-" + System.nanoTime() + "@example.com")
                .passwordHash("$2a$12$dummydummydummydummydummydummydummydummydummydummydum")
                .role(Role.SALESPERSON)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("open creates an active session with the opening float captured")
    void opensSession() {
        PosSessionDTO session = posService.open(cashier.getId(),
                new OpenPosSessionRequest(new BigDecimal("200.00"), "morning till"));

        assertThat(session.userId()).isEqualTo(cashier.getId());
        assertThat(session.openedAt()).isNotNull();
        assertThat(session.closedAt()).isNull();
        assertThat(session.openingFloat()).isEqualByComparingTo("200.00");
    }

    @Test
    @DisplayName("opening a second session for the same user is rejected while the first is still active")
    void rejectsDoubleOpen() {
        posService.open(cashier.getId(), new OpenPosSessionRequest(BigDecimal.ZERO, null));

        assertThatThrownBy(() -> posService.open(cashier.getId(),
                new OpenPosSessionRequest(BigDecimal.ZERO, "oops")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("POS_SESSION_OPEN");

        assertThat(posSessionRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("close marks the active session closed, records the closing float, and clears active status")
    void closesSession() {
        posService.open(cashier.getId(), new OpenPosSessionRequest(new BigDecimal("100.00"), null));

        PosSessionDTO closed = posService.close(cashier.getId(),
                new ClosePosSessionRequest(new BigDecimal("412.50"), "end of shift"));

        assertThat(closed.closedAt()).isNotNull();
        assertThat(closed.closingFloat()).isEqualByComparingTo("412.50");
        assertThat(closed.notes()).isEqualTo("end of shift");

        // No active session remains — a subsequent open() should succeed rather than throw POS_SESSION_OPEN.
        PosSessionDTO next = posService.open(cashier.getId(),
                new OpenPosSessionRequest(new BigDecimal("200.00"), null));
        assertThat(next.id()).isNotEqualTo(closed.id());
        assertThat(next.closedAt()).isNull();
    }

    @Test
    @DisplayName("active() throws when there is no open session for the user")
    void activeRequiresOpenSession() {
        assertThatThrownBy(() -> posService.active(cashier.getId()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Active POS session");
    }

    @Test
    @DisplayName("close() throws when there is nothing to close")
    void closeRequiresOpenSession() {
        assertThatThrownBy(() -> posService.close(cashier.getId(),
                new ClosePosSessionRequest(new BigDecimal("0.00"), null)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Active POS session");
    }
}
