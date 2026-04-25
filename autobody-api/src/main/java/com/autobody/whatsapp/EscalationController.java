package com.autobody.whatsapp;

import com.autobody.security.AppUserPrincipal;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import com.autobody.whatsapp.dto.ConversationDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/escalations")
@RequiredArgsConstructor
@Tag(name = "Escalations")
public class EscalationController {

    private final EscalationService escalationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<PagedResponse<ConversationDTO>> list(Pageable pageable) {
        PagedResponse<ConversationDTO> page = PagedResponse.from(escalationService.listEscalated(pageable));
        return ApiResponse.paged(page, page.toMeta());
    }

    @PostMapping("/{id}/claim")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON')")
    public ApiResponse<ConversationDTO> claim(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return ApiResponse.ok(escalationService.claim(id, principal.id()), "Conversation claimed");
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON')")
    public ApiResponse<ConversationDTO> resolve(@PathVariable Long id) {
        return ApiResponse.ok(escalationService.resolve(id), "Conversation resolved");
    }
}
