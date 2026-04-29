package com.autobody.posibolt;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PosiboltClient {

    private final WebClient.Builder webClientBuilder;
    private final PosiboltProperties properties;

    public boolean isConfigured() {
        return StringUtils.hasText(properties.baseUrl()) && StringUtils.hasText(properties.apiToken());
    }

    public boolean isEnabled() {
        return isConfigured() && properties.syncEnabled();
    }

    public List<JsonNode> fetchProducts() {
        return fetchArray(properties.productsPath());
    }

    public List<JsonNode> fetchStock() {
        return fetchArray(properties.stockPath());
    }

    public List<JsonNode> fetchOrders() {
        return fetchArray(properties.ordersPath());
    }

    private List<JsonNode> fetchArray(String path) {
        if (!isEnabled() || !StringUtils.hasText(path)) return List.of();

        JsonNode root = webClientBuilder.build()
                .get()
                .uri(join(properties.baseUrl(), path))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiToken())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        if (root == null || root.isNull()) return List.of();
        JsonNode items = firstArray(root, "data", "items", "products", "stock", "orders", "records");
        if (items == null && root.isArray()) items = root;
        if (items == null || !items.isArray()) {
            log.warn("Posibolt response at {} did not contain a recognizable array", path);
            return List.of();
        }
        return items.findValues("").isEmpty()
                ? streamArray(items)
                : streamArray(items);
    }

    private static JsonNode firstArray(JsonNode root, String... fields) {
        for (String field : fields) {
            JsonNode value = root.path(field);
            if (value.isArray()) return value;
        }
        return null;
    }

    private static List<JsonNode> streamArray(JsonNode array) {
        java.util.ArrayList<JsonNode> out = new java.util.ArrayList<>();
        array.elements().forEachRemaining(out::add);
        return out;
    }

    private static String join(String base, String path) {
        String cleanBase = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        return cleanBase + cleanPath;
    }
}
