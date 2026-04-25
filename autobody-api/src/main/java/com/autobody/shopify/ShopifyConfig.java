package com.autobody.shopify;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ShopifyProperties.class)
public class ShopifyConfig {
}
