package com.autobody.inventory.movement;

import com.autobody.inventory.movement.dto.CreateStockMovementRequest;
import com.autobody.inventory.movement.dto.StockMovementDTO;
import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Verifies the invariants that sit underneath every sale and restock:
 *  - RECEIVE increments qty_on_hand exactly by the positive delta
 *  - SALE / WRITE_OFF decrement, but only when stock covers the request
 *  - ADJUST passes signed quantities through
 *  - insufficient-stock requests throw and leave qty_on_hand untouched
 */
class StockMovementServiceIT extends AbstractPostgresIntegrationTest {

    @Autowired private StockMovementService stockMovementService;
    @Autowired private StockMovementRepository stockMovementRepository;
    @Autowired private PartRepository partRepository;

    @BeforeEach
    void cleanSlate() {
        stockMovementRepository.deleteAll();
        partRepository.deleteAll();
    }

    private Part newPart(String sku, int qty) {
        return partRepository.save(Part.builder()
                .sku(sku)
                .name("Part " + sku)
                .qtyOnHand(qty)
                .lowStockThreshold(2)
                .sellPrice(new BigDecimal("50.00"))
                .active(true)
                .build());
    }

    @Test
    @DisplayName("RECEIVE increments qty_on_hand by the requested quantity")
    void receiveIncrements() {
        Part p = newPart("REC-1", 4);

        StockMovementDTO dto = stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.RECEIVE, 6, "PO-42", "restock"),
                null);

        assertThat(dto.qty()).isEqualTo(6);
        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(10);
    }

    @Test
    @DisplayName("SALE decrements qty_on_hand and stores a negative delta")
    void saleDecrements() {
        Part p = newPart("SAL-1", 10);

        StockMovementDTO dto = stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.SALE, 3, "ORDER-1", null),
                null);

        assertThat(dto.qty()).isEqualTo(-3);
        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(7);
    }

    @Test
    @DisplayName("insufficient stock is rejected with BusinessRuleException and leaves qty unchanged")
    void rejectsOverSale() {
        Part p = newPart("SHORT-1", 2);

        assertThatThrownBy(() -> stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.SALE, 5, "ORDER-99", null),
                null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("INSUFFICIENT_STOCK")
                .hasMessageContaining("SHORT-1");

        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(2);
        assertThat(stockMovementRepository.count()).isZero();
    }

    @Test
    @DisplayName("WRITE_OFF decrements and is blocked by the same insufficient-stock guard")
    void writeOffBehavesLikeSale() {
        Part p = newPart("WRITE-1", 3);

        stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.WRITE_OFF, 2, "DAMAGE-1", "dropped"),
                null);
        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(1);

        assertThatThrownBy(() -> stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.WRITE_OFF, 5, "DAMAGE-2", null),
                null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("INSUFFICIENT_STOCK");
        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(1);
    }

    @Test
    @DisplayName("ADJUST applies the signed quantity verbatim (both + and -)")
    void adjustPassesSignedDelta() {
        Part p = newPart("ADJ-1", 5);

        stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.ADJUST, 4, "COUNT-UP", null),
                null);
        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(9);

        stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.ADJUST, -2, "COUNT-DOWN", null),
                null);
        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(7);
    }

    @Test
    @DisplayName("zero quantity is rejected with INVALID_QTY")
    void rejectsZeroQty() {
        Part p = newPart("ZERO-1", 5);

        assertThatThrownBy(() -> stockMovementService.record(
                new CreateStockMovementRequest(p.getId(), MovementType.ADJUST, 0, null, null),
                null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("INVALID_QTY");

        assertThat(partRepository.findById(p.getId()).orElseThrow().getQtyOnHand()).isEqualTo(5);
    }
}
