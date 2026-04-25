package com.autobody.whatsapp;

import com.autobody.shared.dto.ApiResponse;
import com.autobody.whatsapp.dto.BroadcastRequest;
import com.autobody.whatsapp.dto.BroadcastResultDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/broadcast")
@RequiredArgsConstructor
@Tag(name = "Broadcast")
public class BroadcastController {

    private final BroadcastService broadcastService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BroadcastResultDTO> broadcast(@Valid @RequestBody BroadcastRequest req) {
        return ApiResponse.ok(broadcastService.broadcast(req), "Broadcast queued");
    }
}
