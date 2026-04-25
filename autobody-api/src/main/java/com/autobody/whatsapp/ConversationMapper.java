package com.autobody.whatsapp;

import com.autobody.customer.Customer;
import com.autobody.user.User;
import com.autobody.whatsapp.dto.ConversationDTO;
import org.springframework.stereotype.Component;

@Component
public class ConversationMapper {

    public ConversationDTO toDto(Conversation c) {
        Customer customer = c.getCustomer();
        User escalatedTo = c.getEscalatedTo();
        return new ConversationDTO(
                c.getId(),
                customer == null ? null : customer.getId(),
                customer == null ? null : customer.getName(),
                customer == null ? null : customer.getPhone(),
                c.getWaThreadId(),
                c.getStatus(),
                c.getBotStep(),
                Boolean.TRUE.equals(c.getEscalated()),
                escalatedTo == null ? null : escalatedTo.getId(),
                c.getPartRequest(),
                c.getCreatedAt(),
                c.getUpdatedAt());
    }
}
