package com.autobody.shopify;

import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopifySyncService {

    private final PartRepository partRepository;
    private final ShopifyClient shopifyClient;

    @Transactional(readOnly = true)
    public void syncActiveParts() {
        if (!shopifyClient.isConfigured()) return;
        int synced = 0;
        for (Part part : partRepository.findTop200ByActiveTrueOrderByUpdatedAtDesc()) {
            if (part.getSellPrice() == null) continue;
            shopifyClient.upsertInventoryItem(
                    part.getSku(),
                    part.getName(),
                    part.getQtyOnHand() != null ? part.getQtyOnHand() : 0,
                    part.getSellPrice().toPlainString()
            );
            synced++;
        }
        log.info("Shopify sync completed; {} parts attempted", synced);
    }
}
