package com.autobody.posibolt;

import com.autobody.shared.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "posibolt_sync_state")
@Getter
@Setter
public class PosiboltSyncState extends AuditableEntity {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private Boolean configured = Boolean.FALSE;

    @Column(nullable = false)
    private Boolean enabled = Boolean.FALSE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PosiboltSyncStatus status = PosiboltSyncStatus.NOT_CONFIGURED;

    private Instant lastStartedAt;

    private Instant lastFinishedAt;

    private Instant lastSuccessfulSyncAt;

    @Column(columnDefinition = "TEXT")
    private String lastError;

    @Column(nullable = false)
    private Integer productsSynced = 0;

    @Column(nullable = false)
    private Integer stockSynced = 0;

    @Column(nullable = false)
    private Integer ordersSynced = 0;
}
