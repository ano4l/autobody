package com.autobody.whatsapp;

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
public class WhatsAppClient {

    private final WebClient.Builder webClientBuilder;
    private final WhatsAppProperties properties;

    public void sendText(String to, String body) {
        if (!StringUtils.hasText(properties.token()) || !StringUtils.hasText(properties.phoneNumberId())) {
            log.debug("WhatsApp token/phoneNumberId missing; skipping outbound send");
            return;
        }

        String url = "%s/%s/messages".formatted(properties.apiUrl(), properties.phoneNumberId());
        Map<String, Object> payload = Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "type", "text",
                "text", Map.of("body", body)
        );

        webClientBuilder.build()
                .post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .toBodilessEntity()
                .doOnError(ex -> log.warn("Failed to send WhatsApp message to {}: {}", to, ex.getMessage()))
                .onErrorResume(ex -> reactor.core.publisher.Mono.empty())
                .block();
    }
}
