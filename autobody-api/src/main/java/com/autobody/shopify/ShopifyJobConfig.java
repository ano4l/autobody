package com.autobody.shopify;

import org.quartz.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ShopifyJobConfig {

    @Bean
    public JobDetail shopifySyncJobDetail() {
        return JobBuilder.newJob(ShopifySyncJob.class)
                .withIdentity("shopifySyncJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger shopifySyncTrigger(
            JobDetail shopifySyncJobDetail,
            @Value("${shopify.sync-cron:0 0/15 * * * ?}") String syncCron) {
        return TriggerBuilder.newTrigger()
                .forJob(shopifySyncJobDetail)
                .withIdentity("shopifySyncTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule(syncCron))
                .build();
    }
}
