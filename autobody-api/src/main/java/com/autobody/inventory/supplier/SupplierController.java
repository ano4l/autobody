package com.autobody.inventory.supplier;

import com.autobody.inventory.supplier.dto.CreateSupplierRequest;
import com.autobody.inventory.supplier.dto.SupplierDTO;
import com.autobody.inventory.supplier.dto.UpdateSupplierRequest;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ApiResponse<PagedResponse<SupplierDTO>> list(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        PagedResponse<SupplierDTO> page = PagedResponse.from(supplierService.list(search, pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @GetMapping("/{id}")
    public ApiResponse<SupplierDTO> get(@PathVariable Long id) {
        return ApiResponse.ok(supplierService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE')")
    public ResponseEntity<ApiResponse<SupplierDTO>> create(@Valid @RequestBody CreateSupplierRequest req) {
        return ResponseEntity.status(201)
                .body(ApiResponse.ok(supplierService.create(req), "Supplier created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE')")
    public ApiResponse<SupplierDTO> update(@PathVariable Long id,
                                           @Valid @RequestBody UpdateSupplierRequest req) {
        return ApiResponse.ok(supplierService.update(id, req), "Supplier updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ApiResponse.ok(null, "Supplier deleted");
    }
}
