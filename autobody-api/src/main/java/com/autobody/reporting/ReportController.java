package com.autobody.reporting;

import com.autobody.reporting.dto.DeadStockDTO;
import com.autobody.reporting.dto.MarginRowDTO;
import com.autobody.reporting.dto.SalesPointDTO;
import com.autobody.reporting.dto.TopPartDTO;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<List<SalesPointDTO>> sales(
            @RequestParam(defaultValue = "day") String granularity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        Instant rangeTo = to == null ? Instant.now() : to;
        Instant rangeFrom = from == null ? rangeTo.minus(Duration.ofDays(30)) : from;
        return ApiResponse.ok(reportService.sales(granularity, rangeFrom, rangeTo));
    }

    @GetMapping("/top-parts")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<List<TopPartDTO>> topParts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "20") int limit) {
        Instant rangeTo = to == null ? Instant.now() : to;
        Instant rangeFrom = from == null ? rangeTo.minus(Duration.ofDays(30)) : from;
        return ApiResponse.ok(reportService.topParts(rangeFrom, rangeTo, Math.min(limit, 100)));
    }

    @GetMapping("/dead-stock")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','VIEW_ONLY')")
    public ApiResponse<PagedResponse<DeadStockDTO>> deadStock(
            @RequestParam(defaultValue = "60") int days,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        var p = PagedResponse.from(reportService.deadStock(days, PageRequest.of(page, Math.min(size, 200))));
        return ApiResponse.paged(p, p.toMeta());
    }

    @GetMapping("/margin")
    @PreAuthorize("hasAnyRole('ADMIN','VIEW_ONLY')")
    public ApiResponse<List<MarginRowDTO>> margin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "50") int limit) {
        Instant rangeTo = to == null ? Instant.now() : to;
        Instant rangeFrom = from == null ? rangeTo.minus(Duration.ofDays(30)) : from;
        return ApiResponse.ok(reportService.margin(rangeFrom, rangeTo, Math.min(limit, 200)));
    }
}
