package com.autobody.shopify;

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
public class ShopifySyncJob extends QuartzJobBean {

    private final ShopifySyncService syncService;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        try {
            syncService.syncActiveParts();
        } catch (Exception ex) {
            log.error("Shopify sync job failed", ex);
            throw new JobExecutionException(ex);
        }
    }
}
