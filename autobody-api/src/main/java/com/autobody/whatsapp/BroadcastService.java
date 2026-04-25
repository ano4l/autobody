package com.autobody.whatsapp;

import com.autobody.whatsapp.dto.BroadcastRequest;
import com.autobody.whatsapp.dto.BroadcastResultDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BroadcastService {

    private final WhatsAppClient whatsAppClient;

    public BroadcastResultDTO broadcast(BroadcastRequest req) {
        int sent = 0;
        int failed = 0;
        for (String to : req.recipients()) {
            try {
                whatsAppClient.sendText(to, req.message());
                sent++;
            } catch (RuntimeException ex) {
                log.warn("Broadcast send failed for {}: {}", to, ex.getMessage());
                failed++;
            }
        }
        return new BroadcastResultDTO(req.recipients().size(), sent, failed);
    }
}
