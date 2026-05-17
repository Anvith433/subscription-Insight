package com.yourorg.UsageTracking.dto;

import java.time.LocalDate;

public record UsageTrackingRequest(
        String serviceName,
        Integer minutesUsed,
        LocalDate date,
        String idempotencyKey
) {
}
