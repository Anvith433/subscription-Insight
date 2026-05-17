package com.yourorg.BillingRecord.dto;

import java.time.Instant;

public record BillingResponse(
        Long id,
        Long subscriptionId,
        String providerName,
        Double amount,
        String currency,
        String billingPeriod,
        Instant paidAt,
        String paymentMethod,
        String source,
        Instant createdAt
) {
}
