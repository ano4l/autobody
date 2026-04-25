package com.autobody.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@Configuration
public class AsyncConfig {
    // Thread-pool sizing lives in application.properties (spring.task.execution.*).
}
