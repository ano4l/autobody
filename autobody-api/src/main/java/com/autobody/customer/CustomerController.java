package com.autobody.customer;

import com.autobody.customer.dto.CreateCustomerRequest;
import com.autobody.customer.dto.CustomerDTO;
import com.autobody.customer.dto.UpdateCustomerRequest;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<PagedResponse<CustomerDTO>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CustomerSource source,
            Pageable pageable) {
        PagedResponse<CustomerDTO> page = PagedResponse.from(customerService.list(search, source, pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<CustomerDTO> get(@PathVariable Long id) {
        return ApiResponse.ok(customerService.get(id));
    }

    @GetMapping("/phone/{phone}")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<CustomerDTO> getByPhone(@PathVariable String phone) {
        return ApiResponse.ok(customerService.getByPhone(phone));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON')")
    public ResponseEntity<ApiResponse<CustomerDTO>> create(@Valid @RequestBody CreateCustomerRequest req) {
        CustomerDTO created = customerService.create(req);
        return ResponseEntity.status(201).body(ApiResponse.ok(created, "Customer created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE','SALESPERSON')")
    public ApiResponse<CustomerDTO> update(@PathVariable Long id,
                                           @Valid @RequestBody UpdateCustomerRequest req) {
        return ApiResponse.ok(customerService.update(id, req), "Customer updated");
    }
}
