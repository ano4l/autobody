package com.autobody.whatsapp;

import com.autobody.customer.Customer;
import com.autobody.shared.audit.AuditableEntity;
import com.autobody.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "wa_thread_id", length = 100, unique = true)
    private String waThreadId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private ConversationStatus status = ConversationStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "bot_step", length = 30)
    @Builder.Default
    private BotStep botStep = BotStep.GREETING;

    @Column(nullable = false)
    @Builder.Default
    private Boolean escalated = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalated_to")
    private User escalatedTo;

    @Column(name = "part_request", columnDefinition = "TEXT")
    private String partRequest;
}
