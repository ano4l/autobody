package com.autobody.posibolt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class PosiboltSyncJob extends QuartzJobBean {

    private final PosiboltSyncService syncService;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        try {
            syncService.syncNow();
        } catch (Exception ex) {
            log.error("Scheduled POSibolt sync failed", ex);
        }
    }
}
