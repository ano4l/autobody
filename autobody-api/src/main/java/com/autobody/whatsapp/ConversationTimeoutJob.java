package com.autobody.whatsapp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class ConversationTimeoutJob extends QuartzJobBean {

    private final ConversationTimeoutService timeoutService;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        try {
            timeoutService.sweep();
        } catch (Exception ex) {
            log.error("Conversation timeout sweep failed", ex);
            throw new JobExecutionException(ex);
        }
    }
}
