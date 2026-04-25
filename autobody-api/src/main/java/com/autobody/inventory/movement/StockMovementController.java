package com.autobody.inventory.movement;

import com.autobody.inventory.movement.dto.CreateStockMovementRequest;
import com.autobody.inventory.movement.dto.StockMovementDTO;
import com.autobody.security.AppUserPrincipal;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@Tag(name = "Stock Movements")
public class StockMovementController {

    private final StockMovementService service;

    @GetMapping
    public ApiResponse<PagedResponse<StockMovementDTO>> list(
            @RequestParam(required = false) Long partId,
            @RequestParam(required = false) MovementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            Pageable pageable) {
        PagedResponse<StockMovementDTO> page = PagedResponse.from(
                service.search(partId, type, from, to, pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON')")
    public ResponseEntity<ApiResponse<StockMovementDTO>> create(
            @Valid @RequestBody CreateStockMovementRequest req,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        StockMovementDTO created = service.record(req, principal != null ? principal.id() : null);
        return ResponseEntity.status(201).body(ApiResponse.ok(created, "Movement recorded"));
    }
}
