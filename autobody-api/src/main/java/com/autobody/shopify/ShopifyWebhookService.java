package com.autobody.shopify;

import com.autobody.customer.Customer;
import com.autobody.customer.CustomerRepository;
import com.autobody.customer.CustomerSource;
import com.autobody.order.Order;
import com.autobody.order.OrderRepository;
import com.autobody.order.OrderSource;
import com.autobody.order.OrderStatus;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopifyWebhookService {

    private final ShopifyProperties properties;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public boolean verifyWebhook(String rawPayload, String hmacHeader) {
        if (!StringUtils.hasText(properties.webhookSecret())) {
            log.debug("shopify.webhook-secret missing; skipping Shopify HMAC validation");
            return true;
        }
        if (!StringUtils.hasText(hmacHeader)) return false;
        String expected = hmacBase64(rawPayload, properties.webhookSecret());
        return expected.equals(hmacHeader.trim());
    }

    @Transactional
    public void handleOrderCreated(JsonNode payload) {
        String shopifyOrderId = text(payload, "id");
        if (!StringUtils.hasText(shopifyOrderId)) return;

        if (orderRepository.findByShopifyOrderId(shopifyOrderId).isPresent()) return;

        String email = text(payload, "email");
        String customerName = payload.path("customer").path("first_name").asText("")
                + " " + payload.path("customer").path("last_name").asText("");
        customerName = customerName.trim();

        Customer customer = null;
        if (StringUtils.hasText(email)) {
            customer = customerRepository.findTopByEmailIgnoreCase(email).orElse(null);
        }
        if (customer == null && StringUtils.hasText(customerName)) {
            customer = customerRepository.save(Customer.builder()
                    .name(customerName)
                    .email(email)
                    .source(CustomerSource.SHOPIFY)
                    .build());
        }

        BigDecimal subtotal = parseDecimal(text(payload, "subtotal_price"));
        BigDecimal total = parseDecimal(text(payload, "total_price"));
        BigDecimal discount = subtotal != null && total != null ? subtotal.subtract(total) : BigDecimal.ZERO;

        orderRepository.save(Order.builder()
                .customer(customer)
                .source(OrderSource.SHOPIFY)
                .status(OrderStatus.CONFIRMED)
                .subtotal(subtotal != null ? subtotal : BigDecimal.ZERO)
                .discount(discount.max(BigDecimal.ZERO))
                .total(total != null ? total : BigDecimal.ZERO)
                .shopifyOrderId(shopifyOrderId)
                .notes("Imported from Shopify webhook")
                .build());
    }

    private static String text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        return v.isMissingNode() || v.isNull() ? null : v.asText();
    }

    private static BigDecimal parseDecimal(String s) {
        if (!StringUtils.hasText(s)) return null;
        try {
            return new BigDecimal(s.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String hmacBase64(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to verify Shopify webhook HMAC", e);
        }
    }
}
