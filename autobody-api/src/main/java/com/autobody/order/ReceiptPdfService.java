package com.autobody.order;

import com.autobody.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptPdfService {
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
            .withZone(ZoneId.systemDefault());
    private static final PDType1Font FONT = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public byte[] generateOrderReceipt(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = 800f;
                y = text(cs, "Autobody Automation - Sales Receipt", 16, 50, y);
                y -= 8;
                y = text(cs, "Order: #" + order.getId(), 11, 50, y);
                y = text(cs, "Date: " + DATE_FMT.format(order.getCreatedAt()), 11, 50, y);
                y = text(cs, "Customer: " + (order.getCustomer() != null ? safe(order.getCustomer().getName()) : "Walk-in"), 11, 50, y);
                y = text(cs, "Source: " + order.getSource(), 11, 50, y);
                y -= 12;

                y = text(cs, "Items", 13, 50, y);
                y = text(cs, "SKU", 10, 50, y);
                y = text(cs, "Name", 10, 120, y);
                y = text(cs, "Qty", 10, 360, y);
                y = text(cs, "Unit", 10, 410, y);
                y = text(cs, "Line", 10, 500, y);
                y -= 6;

                for (OrderItem item : items) {
                    BigDecimal line = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQty()));
                    y = text(cs, safe(item.getPart().getSku()), 10, 50, y);
                    y = text(cs, truncate(safe(item.getPart().getName()), 34), 10, 120, y);
                    y = text(cs, String.valueOf(item.getQty()), 10, 360, y);
                    y = text(cs, money(item.getUnitPrice()), 10, 410, y);
                    y = text(cs, money(line), 10, 500, y);
                    if (y < 120f) break;
                }

                y -= 16;
                y = text(cs, "Subtotal: " + money(order.getSubtotal()), 11, 400, y);
                y = text(cs, "Discount: " + money(order.getDiscount()), 11, 400, y);
                y = text(cs, "Total: " + money(order.getTotal()), 12, 400, y);
                y -= 10;
                if (order.getNotes() != null && !order.getNotes().isBlank()) {
                    y = text(cs, "Notes: " + truncate(order.getNotes(), 70), 10, 50, y);
                }
                text(cs, "Thank you for your business.", 10, 50, 70);
            }

            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate receipt PDF", e);
        }
    }

    private static float text(PDPageContentStream cs, String value, int size, float x, float y) throws IOException {
        cs.beginText();
        cs.setFont(FONT, size);
        cs.newLineAtOffset(x, y);
        cs.showText(value);
        cs.endText();
        return y - (size + 4f);
    }

    private static String money(BigDecimal value) {
        return value == null ? "0.00" : value.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 1) + "...";
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
