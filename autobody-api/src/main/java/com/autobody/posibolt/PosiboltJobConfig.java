package com.autobody.posibolt;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PosiboltJobConfig {

    @Bean
    public JobDetail posiboltSyncJobDetail() {
        return JobBuilder.newJob(PosiboltSyncJob.class)
                .withIdentity("posiboltSyncJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger posiboltSyncTrigger(
            JobDetail posiboltSyncJobDetail,
            @Value("${posibolt.sync-cron:0 0/5 * * * ?}") String syncCron) {
        return TriggerBuilder.newTrigger()
                .forJob(posiboltSyncJobDetail)
                .withIdentity("posiboltSyncTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule(syncCron))
                .build();
    }
}
