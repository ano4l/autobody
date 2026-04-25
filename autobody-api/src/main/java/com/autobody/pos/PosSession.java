package com.autobody.pos;

import com.autobody.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pos_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PosSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "opened_at", nullable = false, updatable = false)
    private Instant openedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "opening_float", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal openingFloat = BigDecimal.ZERO;

    @Column(name = "closing_float", precision = 10, scale = 2)
    private BigDecimal closingFloat;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
