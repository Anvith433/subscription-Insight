package com.yourorg.Subscriptions.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionRequest(
        String providerName,
        String category,
        LocalDate startDate,
        String renewalCycle,
        LocalDate renewalDate,
        BigDecimal price,
        String currency,
        String status
) {
}
