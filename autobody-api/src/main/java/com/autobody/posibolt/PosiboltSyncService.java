package com.autobody.posibolt;

import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.posibolt.dto.PosiboltSyncStatusDTO;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosiboltSyncService {

    private static final long STATE_ID = 1L;

    private final PosiboltClient client;
    private final PosiboltSyncStateRepository stateRepository;
    private final PartRepository partRepository;

    @Transactional(readOnly = true)
    public PosiboltSyncStatusDTO status() {
        return toDto(loadState());
    }

    @Transactional
    public PosiboltSyncStatusDTO syncNow() {
        PosiboltSyncState state = loadState();
        state.setConfigured(client.isConfigured());
        state.setEnabled(client.isEnabled());
        if (!client.isEnabled()) {
            state.setStatus(PosiboltSyncStatus.NOT_CONFIGURED);
            state.setLastError("Set POSIBOLT_BASE_URL, POSIBOLT_API_TOKEN and POSIBOLT_SYNC_ENABLED=true to enable sync.");
            return toDto(stateRepository.save(state));
        }

        state.setStatus(PosiboltSyncStatus.RUNNING);
        state.setLastStartedAt(Instant.now());
        state.setLastFinishedAt(null);
        state.setLastError(null);
        stateRepository.saveAndFlush(state);

        try {
            int products = syncProducts();
            int stock = syncStock();
            int orders = client.fetchOrders().size();

            state.setProductsSynced(products);
            state.setStockSynced(stock);
            state.setOrdersSynced(orders);
            state.setStatus(PosiboltSyncStatus.SUCCESS);
            state.setLastSuccessfulSyncAt(Instant.now());
            log.info("Posibolt sync completed: products={}, stock={}, orders={}", products, stock, orders);
        } catch (Exception ex) {
            state.setStatus(PosiboltSyncStatus.FAILED);
            state.setLastError(ex.getMessage());
            log.error("Posibolt sync failed", ex);
        } finally {
            state.setConfigured(client.isConfigured());
            state.setEnabled(client.isEnabled());
            state.setLastFinishedAt(Instant.now());
        }

        return toDto(stateRepository.save(state));
    }

    private int syncProducts() {
        int synced = 0;
        for (JsonNode item : client.fetchProducts()) {
            String sku = text(item, "sku", "SKU", "code", "itemCode", "productcode", "productCode");
            String name = text(item, "name", "description", "productname", "productName", "title");
            BigDecimal price = decimal(item, "sellPrice", "sellingPrice", "price", "productprice", "productPrice");
            if (!StringUtils.hasText(sku) || !StringUtils.hasText(name)) continue;

            Part part = partRepository.findBySkuIgnoreCase(sku).orElseGet(() -> Part.builder()
                    .sku(sku)
                    .name(name)
                    .sellPrice(price != null ? price : BigDecimal.ZERO)
                    .qtyOnHand(0)
                    .active(Boolean.TRUE)
                    .build());

            part.setName(name);
            if (price != null) part.setSellPrice(price);
            Integer qty = integer(item, "qtyOnHand", "quantity", "qty", "stock", "availableQty", "productqty");
            if (qty != null) part.setQtyOnHand(qty);
            setIfPresent(item, "category", part::setCategory);
            setIfPresent(item, "make", part::setMake);
            setIfPresent(item, "model", part::setModel);
            setIfPresent(item, "location", part::setLocation);
            setIfPresent(item, "id", part::setPosiboltProductId);
            setIfPresent(item, "productId", part::setPosiboltProductId);
            partRepository.save(part);
            synced++;
        }
        return synced;
    }

    private int syncStock() {
        int synced = 0;
        for (JsonNode item : client.fetchStock()) {
            String sku = text(item, "sku", "SKU", "code", "itemCode", "productcode", "productCode");
            Integer qty = integer(item, "qtyOnHand", "quantity", "qty", "stock", "availableQty", "productqty");
            if (!StringUtils.hasText(sku) || qty == null) continue;

            partRepository.findBySkuIgnoreCase(sku).ifPresent(part -> {
                part.setQtyOnHand(qty);
                partRepository.save(part);
            });
            synced++;
        }
        return synced;
    }

    private PosiboltSyncState loadState() {
        PosiboltSyncState state = stateRepository.findById(STATE_ID).orElseGet(() -> {
            PosiboltSyncState created = new PosiboltSyncState();
            created.setId(STATE_ID);
            return created;
        });
        state.setConfigured(client.isConfigured());
        state.setEnabled(client.isEnabled());
        if (!client.isConfigured()) state.setStatus(PosiboltSyncStatus.NOT_CONFIGURED);
        else if (state.getStatus() == PosiboltSyncStatus.NOT_CONFIGURED) state.setStatus(PosiboltSyncStatus.IDLE);
        return state;
    }

    private static PosiboltSyncStatusDTO toDto(PosiboltSyncState state) {
        return new PosiboltSyncStatusDTO(
                Boolean.TRUE.equals(state.getConfigured()),
                Boolean.TRUE.equals(state.getEnabled()),
                state.getStatus(),
                state.getLastStartedAt(),
                state.getLastFinishedAt(),
                state.getLastSuccessfulSyncAt(),
                state.getLastError(),
                state.getProductsSynced() == null ? 0 : state.getProductsSynced(),
                state.getStockSynced() == null ? 0 : state.getStockSynced(),
                state.getOrdersSynced() == null ? 0 : state.getOrdersSynced()
        );
    }

    private static String text(JsonNode node, String... fields) {
        for (String field : fields) {
            JsonNode value = node.path(field);
            if (!value.isMissingNode() && !value.isNull() && StringUtils.hasText(value.asText())) {
                return value.asText().trim();
            }
        }
        return null;
    }

    private static Integer integer(JsonNode node, String... fields) {
        String value = text(node, fields);
        if (!StringUtils.hasText(value)) return null;
        try {
            return new BigDecimal(value).intValue();
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static BigDecimal decimal(JsonNode node, String... fields) {
        String value = text(node, fields);
        if (!StringUtils.hasText(value)) return null;
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static void setIfPresent(JsonNode item, String field, java.util.function.Consumer<String> setter) {
        String value = text(item, field);
        if (StringUtils.hasText(value)) setter.accept(value);
    }
}
