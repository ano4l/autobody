package com.autobody.reporting.dto;

import java.math.BigDecimal;

public record SalesPointDTO(String bucket, BigDecimal revenue, long orderCount) {}
