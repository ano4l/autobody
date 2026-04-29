package com.autobody.posibolt.dto;

import com.autobody.posibolt.PosiboltSyncStatus;

import java.time.Instant;

public record PosiboltSyncStatusDTO(
        boolean configured,
        boolean enabled,
        PosiboltSyncStatus status,
        Instant lastStartedAt,
        Instant lastFinishedAt,
        Instant lastSuccessfulSyncAt,
        String lastError,
        int productsSynced,
        int stockSynced,
        int ordersSynced
) {
}
