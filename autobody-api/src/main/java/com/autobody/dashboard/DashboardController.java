package com.autobody.dashboard;

import com.autobody.dashboard.dto.DashboardStatsDTO;
import com.autobody.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping({"", "/stats"})
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','WAREHOUSE','VIEW_ONLY')")
    public ApiResponse<DashboardStatsDTO> stats() {
        return ApiResponse.ok(dashboardService.stats());
    }
}
