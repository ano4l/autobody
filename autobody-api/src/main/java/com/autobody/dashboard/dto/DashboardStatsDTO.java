package com.autobody.dashboard.dto;

import java.math.BigDecimal;

public record DashboardStatsDTO(
        BigDecimal todaySalesTotal,
        long todayOrderCount,
        long pendingOrderCount,
        long openConversationCount,
        long escalatedConversationCount,
        long lowStockCount
) {}
