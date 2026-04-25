package com.autobody.shopify;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "shopify")
public record ShopifyProperties(
        String storeDomain,
        String adminApiToken,
        String webhookSecret,
        String apiVersion,
        boolean syncEnabled
) {
}
