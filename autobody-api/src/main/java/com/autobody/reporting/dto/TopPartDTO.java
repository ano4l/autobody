package com.autobody.reporting.dto;

import java.math.BigDecimal;

public record TopPartDTO(Long partId, String sku, String name, long qtySold, BigDecimal revenue) {}
