package com.yourorg.Subscriptions.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record SubscriptionResponse(
        Long id,
        String providerName,
        String category,
        LocalDate startDate,
        String renewalCycle,
        LocalDate renewalDate,
        BigDecimal price,
        String currency,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
}
