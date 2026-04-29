package com.autobody.posibolt;

import com.autobody.posibolt.dto.PosiboltSyncStatusDTO;
import com.autobody.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posibolt")
@RequiredArgsConstructor
@Tag(name = "POSibolt")
public class PosiboltController {

    private final PosiboltSyncService syncService;

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','WAREHOUSE')")
    public ApiResponse<PosiboltSyncStatusDTO> status() {
        return ApiResponse.ok(syncService.status());
    }

    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PosiboltSyncStatusDTO> syncNow() {
        return ApiResponse.ok(syncService.syncNow(), "POSibolt sync completed");
    }
}
