package com.autobody.whatsapp;

import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.dto.PagedResponse;
import com.autobody.whatsapp.dto.ConversationDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversations")
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALESPERSON','VIEW_ONLY')")
    public ApiResponse<PagedResponse<ConversationDTO>> list(
            @RequestParam(required = false) ConversationStatus status,
            Pageable pageable) {
        Page<ConversationDTO> page = (status == null
                ? conversationRepository.findAll(pageable)
                : conversationRepository.findByStatus(status, pageable))
                .map(conversationMapper::toDto);
        PagedResponse<ConversationDTO> body = PagedResponse.from(page);
        return ApiResponse.paged(body, body.toMeta());
    }
}
