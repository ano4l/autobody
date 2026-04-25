package com.autobody.pos;

import com.autobody.pos.dto.ClosePosSessionRequest;
import com.autobody.pos.dto.OpenPosSessionRequest;
import com.autobody.pos.dto.PosSessionDTO;
import com.autobody.security.AppUserPrincipal;
import com.autobody.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
@Tag(name = "POS")
public class PosController {
    private final PosService posService;

    @GetMapping("/session")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','WAREHOUSE')")
    public ApiResponse<PosSessionDTO> active(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ApiResponse.ok(posService.active(principal.id()));
    }

    @PostMapping("/session/open")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','WAREHOUSE')")
    public ApiResponse<PosSessionDTO> open(@AuthenticationPrincipal AppUserPrincipal principal,
                                           @Valid @RequestBody OpenPosSessionRequest req) {
        return ApiResponse.ok(posService.open(principal.id(), req), "POS session opened");
    }

    @PostMapping("/session/close")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','WAREHOUSE')")
    public ApiResponse<PosSessionDTO> close(@AuthenticationPrincipal AppUserPrincipal principal,
                                            @Valid @RequestBody ClosePosSessionRequest req) {
        return ApiResponse.ok(posService.close(principal.id(), req), "POS session closed");
    }
}
