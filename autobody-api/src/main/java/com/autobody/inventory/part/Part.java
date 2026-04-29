package com.autobody.inventory.part;

import com.autobody.inventory.supplier.Supplier;
import com.autobody.shared.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "parts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Part extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80, unique = true)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(length = 80)
    private String make;

    @Column(length = 80)
    private String model;

    @Column(name = "year_range_start")
    private Integer yearRangeStart;

    @Column(name = "year_range_end")
    private Integer yearRangeEnd;

    @Column(name = "qty_on_hand", nullable = false)
    @Builder.Default
    private Integer qtyOnHand = 0;

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 2;

    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "sell_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellPrice;

    @Column(length = 80)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "shopify_product_id", length = 100)
    private String shopifyProductId;

    @Column(name = "shopify_variant_id", length = 100)
    private String shopifyVariantId;

    @Column(name = "posibolt_product_id", length = 100)
    private String posiboltProductId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = Boolean.TRUE;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    public boolean isLowStock() {
        return lowStockThreshold != null && qtyOnHand != null && qtyOnHand <= lowStockThreshold;
    }
}
