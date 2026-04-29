package com.autobody.posibolt;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(PosiboltProperties.class)
public class PosiboltConfig {
}
