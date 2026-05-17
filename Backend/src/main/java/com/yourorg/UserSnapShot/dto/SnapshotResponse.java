package com.yourorg.UserSnapShot.dto;

import java.time.Instant;

public record SnapshotResponse(
        Long id,
        Long subscriptionId,
        String providerName,
        String period,
        Integer usageCount,
        Instant lastUsedAt,
        String source,
        Instant createdAt
) {
}
