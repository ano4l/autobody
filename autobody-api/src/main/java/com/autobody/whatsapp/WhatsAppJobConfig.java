package com.autobody.whatsapp;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WhatsAppJobConfig {

    @Bean
    public JobDetail conversationTimeoutJobDetail() {
        return JobBuilder.newJob(ConversationTimeoutJob.class)
                .withIdentity("conversationTimeoutJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger conversationTimeoutTrigger(
            JobDetail conversationTimeoutJobDetail,
            @Value("${meta.whatsapp.timeout-cron:0 0/5 * * * ?}") String timeoutCron) {
        return TriggerBuilder.newTrigger()
                .forJob(conversationTimeoutJobDetail)
                .withIdentity("conversationTimeoutTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule(timeoutCron))
                .build();
    }
}
