package com.autobody.whatsapp;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "meta.whatsapp")
public record WhatsAppProperties(
        String token,
        String phoneNumberId,
        String verifyToken,
        String apiUrl,
        String appSecret
) {
}
