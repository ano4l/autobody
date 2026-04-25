package com.autobody.whatsapp;

import com.autobody.shared.exception.ResourceNotFoundException;
import com.autobody.user.User;
import com.autobody.user.UserRepository;
import com.autobody.whatsapp.dto.ConversationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EscalationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ConversationMapper conversationMapper;

    @Transactional(readOnly = true)
    public Page<ConversationDTO> listEscalated(Pageable pageable) {
        return conversationRepository.findByStatus(ConversationStatus.ESCALATED, pageable)
                .map(conversationMapper::toDto);
    }

    @Transactional
    public ConversationDTO claim(Long conversationId, Long actingUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        User user = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", actingUserId));
        conversation.setEscalatedTo(user);
        conversation.setEscalated(Boolean.TRUE);
        conversation.setStatus(ConversationStatus.ESCALATED);
        return conversationMapper.toDto(conversationRepository.save(conversation));
    }

    @Transactional
    public ConversationDTO resolve(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        conversation.setStatus(ConversationStatus.RESOLVED);
        return conversationMapper.toDto(conversationRepository.save(conversation));
    }
}
