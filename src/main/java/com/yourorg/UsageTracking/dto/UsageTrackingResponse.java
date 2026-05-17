package com.yourorg.UsageTracking.dto;

import java.time.Instant;
import java.time.LocalDate;

public record UsageTrackingResponse(
        Long id,
        Long userId,
        String serviceName,
        Integer minutesUsed,
        LocalDate date,
        Instant createdAt
) {
}
