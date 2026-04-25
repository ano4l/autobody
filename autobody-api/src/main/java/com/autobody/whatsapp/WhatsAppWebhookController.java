package com.autobody.whatsapp;

import com.autobody.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks/whatsapp")
@RequiredArgsConstructor
public class WhatsAppWebhookController {

    private final WhatsAppProperties properties;
    private final WhatsAppWebhookService webhookService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<String> verify(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String verifyToken,
            @RequestParam(name = "hub.challenge", required = false) String challenge) {
        if ("subscribe".equals(mode) && properties.verifyToken() != null
                && properties.verifyToken().equals(verifyToken)) {
            return ResponseEntity.ok(challenge != null ? challenge : "");
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> receive(
            @RequestBody String rawPayload,
            @org.springframework.web.bind.annotation.RequestHeader(name = "X-Hub-Signature-256", required = false) String signature
    ) throws java.io.IOException {
        if (!webhookService.verifySignature(rawPayload, signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("INVALID_SIGNATURE", "Webhook signature verification failed"));
        }

        JsonNode payload = objectMapper.readTree(rawPayload);
        webhookService.processWebhook(payload);
        return ResponseEntity.ok(ApiResponse.ok(null, "Webhook processed"));
    }
}
