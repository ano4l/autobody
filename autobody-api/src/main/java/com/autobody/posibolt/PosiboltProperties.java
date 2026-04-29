package com.autobody.posibolt;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "posibolt")
public record PosiboltProperties(
        String baseUrl,
        String apiToken,
        String productsPath,
        String stockPath,
        String ordersPath,
        boolean syncEnabled
) {
}
