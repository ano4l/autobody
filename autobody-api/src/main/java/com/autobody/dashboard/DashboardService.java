package com.autobody.dashboard;

import com.autobody.dashboard.dto.DashboardStatsDTO;
import com.autobody.inventory.part.PartRepository;
import com.autobody.order.OrderRepository;
import com.autobody.order.OrderStatus;
import com.autobody.whatsapp.ConversationRepository;
import com.autobody.whatsapp.ConversationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ConversationRepository conversationRepository;
    private final PartRepository partRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO stats() {
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant startOfTomorrow = LocalDate.now(ZoneOffset.UTC).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        BigDecimal todaySales = orderRepository.sumTotalBetween(startOfDay, startOfTomorrow);
        long todayCount = orderRepository.countBetween(startOfDay, startOfTomorrow);
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long openConversations = conversationRepository.countByStatus(ConversationStatus.ACTIVE);
        long escalatedConversations = conversationRepository.countByStatus(ConversationStatus.ESCALATED);
        long lowStock = partRepository.countLowStock();

        return new DashboardStatsDTO(
                todaySales == null ? BigDecimal.ZERO : todaySales,
                todayCount,
                pendingOrders,
                openConversations,
                escalatedConversations,
                lowStock
        );
    }
}
