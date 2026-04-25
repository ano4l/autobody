package com.autobody.inventory.part;

import com.autobody.inventory.part.dto.CreatePartRequest;
import com.autobody.inventory.part.dto.CsvImportResult;
import com.autobody.inventory.part.dto.PartDTO;
import com.autobody.inventory.part.dto.StockCheckResponse;
import com.autobody.inventory.part.dto.UpdatePartRequest;
import com.autobody.inventory.supplier.Supplier;
import com.autobody.inventory.supplier.SupplierRepository;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository partRepository;
    private final SupplierRepository supplierRepository;
    private final PartMapper partMapper;

    @Transactional(readOnly = true)
    public Page<PartDTO> search(String search, String make, String model, Boolean active, Pageable pageable) {
        return partRepository
                .search(normalizeFilter(search), normalizeFilter(make), normalizeFilter(model), active, pageable)
                .map(partMapper::toDto);
    }

    @Transactional(readOnly = true)
    public PartDTO get(Long id) {
        return partMapper.toDto(findEntity(id));
    }

    @Transactional(readOnly = true)
    public StockCheckResponse stockCheckBySku(String sku) {
        Part p = partRepository.findBySkuIgnoreCase(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Part with SKU " + sku + " not found"));
        return partMapper.toStockCheck(p);
    }

    @Transactional(readOnly = true)
    public PartDTO getBySku(String sku) {
        Part p = partRepository.findBySkuIgnoreCase(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Part with SKU " + sku + " not found"));
        return partMapper.toDto(p);
    }

    @Transactional(readOnly = true)
    public Page<PartDTO> lowStock(Pageable pageable) {
        return partRepository.findLowStock(pageable).map(partMapper::toDto);
    }

    @Transactional
    public PartDTO create(CreatePartRequest req) {
        if (partRepository.existsBySkuIgnoreCase(req.sku())) {
            throw new BusinessRuleException("SKU_TAKEN", "SKU already exists: " + req.sku());
        }
        Part part = Part.builder()
                .sku(req.sku())
                .name(req.name())
                .category(req.category())
                .make(req.make())
                .model(req.model())
                .yearRangeStart(req.yearRangeStart())
                .yearRangeEnd(req.yearRangeEnd())
                .qtyOnHand(req.qtyOnHand() != null ? req.qtyOnHand() : 0)
                .lowStockThreshold(req.lowStockThreshold() != null ? req.lowStockThreshold() : 2)
                .costPrice(req.costPrice())
                .sellPrice(req.sellPrice())
                .location(req.location())
                .supplier(resolveSupplier(req.supplierId()))
                .shopifyProductId(req.shopifyProductId())
                .shopifyVariantId(req.shopifyVariantId())
                .active(true)
                .build();
        return partMapper.toDto(partRepository.save(part));
    }

    @Transactional
    public PartDTO update(Long id, UpdatePartRequest req) {
        Part p = findEntity(id);
        if (req.name() != null) p.setName(req.name());
        if (req.category() != null) p.setCategory(req.category());
        if (req.make() != null) p.setMake(req.make());
        if (req.model() != null) p.setModel(req.model());
        if (req.yearRangeStart() != null) p.setYearRangeStart(req.yearRangeStart());
        if (req.yearRangeEnd() != null) p.setYearRangeEnd(req.yearRangeEnd());
        if (req.lowStockThreshold() != null) p.setLowStockThreshold(req.lowStockThreshold());
        if (req.costPrice() != null) p.setCostPrice(req.costPrice());
        if (req.sellPrice() != null) p.setSellPrice(req.sellPrice());
        if (req.location() != null) p.setLocation(req.location());
        if (req.supplierId() != null) p.setSupplier(resolveSupplier(req.supplierId()));
        if (req.shopifyProductId() != null) p.setShopifyProductId(req.shopifyProductId());
        if (req.shopifyVariantId() != null) p.setShopifyVariantId(req.shopifyVariantId());
        if (req.active() != null) p.setActive(req.active());
        return partMapper.toDto(partRepository.save(p));
    }

    @Transactional
    public void softDelete(Long id) {
        Part p = findEntity(id);
        p.setActive(false);
        partRepository.save(p);
    }

    /**
     * Imports parts from a CSV. Expected headers (case-insensitive, order-free):
     * sku, name, category, make, model, year_range_start, year_range_end,
     * qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id.
     * Existing rows (matched by SKU) are updated; new SKUs are created.
     */
    @Transactional
    public CsvImportResult importCsv(MultipartFile file) {
        int total = 0, created = 0, updated = 0, skipped = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BusinessRuleException("EMPTY_CSV", "CSV is empty");
            }
            Map<String, Integer> cols = indexHeaders(headerLine);
            requireColumn(cols, "sku");
            requireColumn(cols, "name");
            requireColumn(cols, "sell_price");

            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.isBlank()) continue;
                total++;
                try {
                    String[] cells = splitCsv(line);
                    String sku = cell(cells, cols, "sku");
                    String name = cell(cells, cols, "name");
                    BigDecimal sellPrice = parseBigDecimal(cell(cells, cols, "sell_price"));
                    if (!StringUtils.hasText(sku) || !StringUtils.hasText(name) || sellPrice == null) {
                        skipped++;
                        errors.add("Row " + rowNum + ": sku/name/sell_price required");
                        continue;
                    }

                    Optional<Part> existing = partRepository.findBySkuIgnoreCase(sku);
                    Part part = existing.orElseGet(Part::new);
                    part.setSku(sku);
                    part.setName(name);
                    setIf(cols, cells, "category", part::setCategory);
                    setIf(cols, cells, "make", part::setMake);
                    setIf(cols, cells, "model", part::setModel);
                    setIntIf(cols, cells, "year_range_start", part::setYearRangeStart);
                    setIntIf(cols, cells, "year_range_end", part::setYearRangeEnd);
                    Integer qty = parseInt(cell(cells, cols, "qty_on_hand"));
                    if (qty != null) part.setQtyOnHand(qty);
                    Integer threshold = parseInt(cell(cells, cols, "low_stock_threshold"));
                    if (threshold != null) part.setLowStockThreshold(threshold);
                    BigDecimal cost = parseBigDecimal(cell(cells, cols, "cost_price"));
                    if (cost != null) part.setCostPrice(cost);
                    part.setSellPrice(sellPrice);
                    setIf(cols, cells, "location", part::setLocation);
                    Long supplierId = parseLong(cell(cells, cols, "supplier_id"));
                    if (supplierId != null) part.setSupplier(resolveSupplier(supplierId));
                    if (part.getActive() == null) part.setActive(true);
                    if (part.getQtyOnHand() == null) part.setQtyOnHand(0);
                    if (part.getLowStockThreshold() == null) part.setLowStockThreshold(2);

                    partRepository.save(part);
                    if (existing.isPresent()) updated++; else created++;
                } catch (Exception ex) {
                    skipped++;
                    errors.add("Row " + rowNum + ": " + ex.getMessage());
                    log.warn("CSV row {} failed: {}", rowNum, ex.getMessage());
                }
            }
        } catch (IOException e) {
            throw new BusinessRuleException("CSV_READ_FAILED", "Could not read CSV: " + e.getMessage());
        }

        log.info("CSV import: total={}, created={}, updated={}, skipped={}", total, created, updated, skipped);
        return new CsvImportResult(total, created, updated, skipped, errors);
    }

    Part findEntity(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", id));
    }

    private Supplier resolveSupplier(Long id) {
        if (id == null) return null;
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    private static String normalizeFilter(String s) {
        return StringUtils.hasText(s) ? s.trim() : "";
    }

    private static Map<String, Integer> indexHeaders(String header) {
        String[] parts = splitCsv(header);
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < parts.length; i++) {
            map.put(parts[i].trim().toLowerCase(), i);
        }
        return map;
    }

    private static void requireColumn(Map<String, Integer> cols, String name) {
        if (!cols.containsKey(name)) {
            throw new BusinessRuleException("MISSING_COLUMN", "CSV missing required column: " + name);
        }
    }

    private static String[] splitCsv(String line) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    cur.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                out.add(cur.toString());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        out.add(cur.toString());
        return out.toArray(new String[0]);
    }

    private static String cell(String[] cells, Map<String, Integer> cols, String name) {
        Integer idx = cols.get(name);
        if (idx == null || idx >= cells.length) return null;
        String v = cells[idx];
        return v == null || v.isBlank() ? null : v.trim();
    }

    private static void setIf(Map<String, Integer> cols, String[] cells, String col,
                              java.util.function.Consumer<String> setter) {
        String v = cell(cells, cols, col);
        if (v != null) setter.accept(v);
    }

    private static void setIntIf(Map<String, Integer> cols, String[] cells, String col,
                                 java.util.function.Consumer<Integer> setter) {
        Integer v = parseInt(cell(cells, cols, col));
        if (v != null) setter.accept(v);
    }

    private static Integer parseInt(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Integer.parseInt(s.trim()); } catch (NumberFormatException e) { return null; }
    }

    private static Long parseLong(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Long.parseLong(s.trim()); } catch (NumberFormatException e) { return null; }
    }

    private static BigDecimal parseBigDecimal(String s) {
        if (s == null || s.isBlank()) return null;
        try { return new BigDecimal(s.trim()); } catch (NumberFormatException e) { return null; }
    }
}
