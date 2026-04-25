package com.autobody.reporting;

import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.order.OrderItemRepository;
import com.autobody.order.OrderRepository;
import com.autobody.reporting.dto.DeadStockDTO;
import com.autobody.reporting.dto.MarginRowDTO;
import com.autobody.reporting.dto.SalesPointDTO;
import com.autobody.reporting.dto.TopPartDTO;
import com.autobody.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PartRepository partRepository;

    @Transactional(readOnly = true)
    public List<SalesPointDTO> sales(String granularity, Instant from, Instant to) {
        String bucket = switch (granularity == null ? "day" : granularity.toLowerCase()) {
            case "day" -> "day";
            case "week" -> "week";
            case "month" -> "month";
            default -> throw new BusinessRuleException("INVALID_GRANULARITY", "granularity must be day|week|month");
        };
        return orderRepository.salesByBucket(bucket, from, to).stream()
                .map(row -> new SalesPointDTO(
                        (String) row[0],
                        toBigDecimal(row[1]),
                        toLong(row[2])))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopPartDTO> topParts(Instant from, Instant to, int limit) {
        return orderItemRepository.topPartsByQty(from, to, PageRequest.of(0, limit)).stream()
                .map(row -> new TopPartDTO(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        toLong(row[3]),
                        toBigDecimal(row[4])))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<DeadStockDTO> deadStock(int days, PageRequest pageable) {
        Instant since = Instant.now().minus(Duration.ofDays(days));
        Page<Part> parts = partRepository.findDeadStockSince(since, pageable);
        Instant now = Instant.now();
        return parts.map(p -> {
            Instant lastSale = orderItemRepository.lastSaleAt(p.getId());
            Long daysSince = lastSale == null ? null : ChronoUnit.DAYS.between(lastSale, now);
            return new DeadStockDTO(
                    p.getId(),
                    p.getSku(),
                    p.getName(),
                    p.getQtyOnHand() == null ? 0 : p.getQtyOnHand(),
                    p.getCostPrice(),
                    p.getSellPrice(),
                    lastSale,
                    daysSince);
        });
    }

    @Transactional(readOnly = true)
    public List<MarginRowDTO> margin(Instant from, Instant to, int limit) {
        return orderItemRepository.marginByPart(from, to, PageRequest.of(0, limit)).stream()
                .map(row -> new MarginRowDTO(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        toLong(row[3]),
                        toBigDecimal(row[5]),
                        toBigDecimal(row[4])))
                .toList();
    }

    private static BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal bd) return bd;
        if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }

    private static long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number n) return n.longValue();
        return 0L;
    }
}
