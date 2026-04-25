package com.autobody.shopify;

import com.autobody.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/shopify")
@RequiredArgsConstructor
public class ShopifyWebhookController {

    private final ShopifyWebhookService webhookService;
    private final ObjectMapper objectMapper;

    @PostMapping("/orders-created")
    public ResponseEntity<ApiResponse<Void>> orderCreated(
            @RequestBody String rawPayload,
            @RequestHeader(name = "X-Shopify-Hmac-Sha256", required = false) String hmacHeader
    ) throws java.io.IOException {
        if (!webhookService.verifyWebhook(rawPayload, hmacHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("INVALID_SIGNATURE", "Shopify webhook signature invalid"));
        }

        JsonNode payload = objectMapper.readTree(rawPayload);
        webhookService.handleOrderCreated(payload);
        return ResponseEntity.ok(ApiResponse.ok(null, "Shopify order webhook processed"));
    }
}
