package com.autobody.config;

import org.springframework.context.annotation.Configuration;

/**
 * Quartz runs as an in-memory scheduler out of the box thanks to
 * spring-boot-starter-quartz. Jobs are wired by classes that declare
 * @Component + QuartzJobBean in their own modules (e.g. shopify, whatsapp).
 * This class exists as an anchor for future scheduler tuning.
 */
@Configuration
public class QuartzConfig {
}
