package com.autobody.inventory.movement;

import com.autobody.inventory.movement.dto.CreateStockMovementRequest;
import com.autobody.inventory.movement.dto.StockMovementDTO;
import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.shared.exception.ResourceNotFoundException;
import com.autobody.user.User;
import com.autobody.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository movementRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;
    private final StockMovementMapper mapper;

    @Transactional(readOnly = true)
    public Page<StockMovementDTO> search(Long partId,
                                         MovementType type,
                                         Instant from,
                                         Instant to,
                                         Pageable pageable) {
        return movementRepository.search(partId, type, from, to, pageable).map(mapper::toDto);
    }

    /**
     * Records a stock movement AND updates the part's qty_on_hand atomically.
     *
     * A pessimistic write-lock is taken on the Part row to prevent two concurrent
     * sales from double-spending the same unit. Because the Part also has a @Version
     * column, any stale update elsewhere will fail with OptimisticLockException.
     */
    @Transactional
    public StockMovementDTO record(CreateStockMovementRequest req, Long actingUserId) {
        if (req.qty() == null || req.qty() == 0) {
            throw new BusinessRuleException("INVALID_QTY", "Quantity must be non-zero");
        }
        Part part = partRepository.findByIdForUpdate(req.partId())
                .orElseThrow(() -> new ResourceNotFoundException("Part", req.partId()));

        int delta = req.movementType().apply(req.qty());
        int newQty = (part.getQtyOnHand() == null ? 0 : part.getQtyOnHand()) + delta;
        if (newQty < 0) {
            throw new BusinessRuleException(
                    "INSUFFICIENT_STOCK",
                    "Not enough stock for %s (have %d, need %d)".formatted(
                            part.getSku(), part.getQtyOnHand(), Math.abs(delta)));
        }
        part.setQtyOnHand(newQty);

        User performedBy = actingUserId == null ? null : userRepository.findById(actingUserId).orElse(null);

        StockMovement movement = StockMovement.builder()
                .part(part)
                .movementType(req.movementType())
                .qty(delta)
                .reference(req.reference())
                .notes(req.notes())
                .performedBy(performedBy)
                .build();

        movement = movementRepository.save(movement);
        partRepository.save(part);

        log.info("Stock movement recorded: part={} sku={} type={} delta={} newQty={}",
                part.getId(), part.getSku(), req.movementType(), delta, newQty);

        return mapper.toDto(movement);
    }
}
