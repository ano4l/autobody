package com.autobody.inventory.part;

import com.autobody.inventory.part.dto.CreatePartRequest;
import com.autobody.inventory.part.dto.CsvImportResult;
import com.autobody.inventory.part.dto.PartDTO;
import com.autobody.inventory.part.dto.StockCheckResponse;
import com.autobody.inventory.part.dto.UpdatePartRequest;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@Tag(name = "Parts")
public class PartController {

    private final PartService partService;

    @GetMapping
    public ApiResponse<PagedResponse<PartDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String make,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        PagedResponse<PartDTO> page = PagedResponse.from(
                partService.search(search, make, model, active, pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @GetMapping("/low-stock")
    public ApiResponse<PagedResponse<PartDTO>> lowStock(Pageable pageable) {
        PagedResponse<PartDTO> page = PagedResponse.from(partService.lowStock(pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @GetMapping("/{id}")
    public ApiResponse<PartDTO> get(@PathVariable Long id) {
        return ApiResponse.ok(partService.get(id));
    }

    @GetMapping("/sku/{sku}")
    public ApiResponse<PartDTO> getBySku(@PathVariable String sku) {
        return ApiResponse.ok(partService.getBySku(sku));
    }

    @GetMapping("/sku/{sku}/stock")
    public ApiResponse<StockCheckResponse> stockCheck(@PathVariable String sku) {
        return ApiResponse.ok(partService.stockCheckBySku(sku));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE')")
    public ResponseEntity<ApiResponse<PartDTO>> create(@Valid @RequestBody CreatePartRequest req) {
        return ResponseEntity.status(201)
                .body(ApiResponse.ok(partService.create(req), "Part created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE')")
    public ApiResponse<PartDTO> update(@PathVariable Long id,
                                       @Valid @RequestBody UpdatePartRequest req) {
        return ApiResponse.ok(partService.update(id, req), "Part updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> softDelete(@PathVariable Long id) {
        partService.softDelete(id);
        return ApiResponse.ok(null, "Part deactivated");
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CsvImportResult> importCsv(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(partService.importCsv(file), "Import complete");
    }
}
