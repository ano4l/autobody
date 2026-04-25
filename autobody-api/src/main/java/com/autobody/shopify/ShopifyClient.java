package com.autobody.shopify;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShopifyClient {

    private final WebClient.Builder webClientBuilder;
    private final ShopifyProperties properties;

    public void upsertInventoryItem(String sku, String title, int qty, String price) {
        if (!isConfigured()) return;

        String url = baseUrl() + "/products.json";
        Map<String, Object> payload = Map.of(
                "product", Map.of(
                        "title", title,
                        "variants", java.util.List.of(Map.of(
                                "sku", sku,
                                "price", price,
                                "inventory_management", "shopify",
                                "inventory_quantity", qty
                        ))
                )
        );

        webClientBuilder.build()
                .post()
                .uri(url)
                .header("X-Shopify-Access-Token", properties.adminApiToken())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .toBodilessEntity()
                .doOnError(ex -> log.warn("Shopify upsert failed for sku {}: {}", sku, ex.getMessage()))
                .onErrorResume(ex -> reactor.core.publisher.Mono.empty())
                .block();
    }

    public boolean isConfigured() {
        boolean ok = StringUtils.hasText(properties.storeDomain())
                && StringUtils.hasText(properties.adminApiToken())
                && StringUtils.hasText(properties.apiVersion())
                && properties.syncEnabled();
        if (!ok) log.debug("Shopify integration not configured or disabled; skipping API call");
        return ok;
    }

    private String baseUrl() {
        return "https://%s/admin/api/%s".formatted(properties.storeDomain(), properties.apiVersion());
    }
}
