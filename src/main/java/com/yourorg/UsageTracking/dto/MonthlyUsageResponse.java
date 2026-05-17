package com.yourorg.UsageTracking.dto;

public record MonthlyUsageResponse(
        String serviceName,
        Integer totalMinutes,
        Integer year,
        Integer month
) {
}
