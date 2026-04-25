package com.autobody.order;

import com.autobody.order.dto.CreateOrderRequest;
import com.autobody.order.dto.OrderDTO;
import com.autobody.security.AppUserPrincipal;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders")
public class OrderController {
    private final OrderService orderService;
    private final ReceiptPdfService receiptPdfService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<PagedResponse<OrderDTO>> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderSource source,
            Pageable pageable) {
        PagedResponse<OrderDTO> page = PagedResponse.from(orderService.list(status, source, pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<OrderDTO> get(@PathVariable Long id) {
        return ApiResponse.ok(orderService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON')")
    public ResponseEntity<ApiResponse<OrderDTO>> create(
            @Valid @RequestBody CreateOrderRequest req,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        OrderDTO created = orderService.create(req, principal != null ? principal.id() : null);
        return ResponseEntity.status(201).body(ApiResponse.ok(created, "Order created"));
    }

    @GetMapping("/{id}/receipt")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON','VIEW_ONLY')")
    public ResponseEntity<byte[]> receipt(@PathVariable Long id) {
        byte[] pdf = receiptPdfService.generateOrderReceipt(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=order-%d-receipt.pdf".formatted(id))
                .body(pdf);
    }
}
