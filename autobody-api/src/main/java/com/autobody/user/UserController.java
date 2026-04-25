package com.autobody.user;

import com.autobody.security.AppUserPrincipal;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import com.autobody.user.dto.CreateUserRequest;
import com.autobody.user.dto.UpdateUserRequest;
import com.autobody.user.dto.UserDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PagedResponse<UserDTO>> list(Pageable pageable) {
        PagedResponse<UserDTO> page = PagedResponse.from(userService.list(pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @GetMapping("/me")
    public ApiResponse<UserDTO> me(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ApiResponse.ok(userService.get(principal.id()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserDTO> get(@PathVariable Long id) {
        return ApiResponse.ok(userService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> create(@Valid @RequestBody CreateUserRequest req) {
        UserDTO created = userService.create(req);
        return ResponseEntity.status(201).body(ApiResponse.ok(created, "User created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserDTO> update(@PathVariable Long id,
                                       @Valid @RequestBody UpdateUserRequest req) {
        return ApiResponse.ok(userService.update(id, req), "User updated");
    }
}
