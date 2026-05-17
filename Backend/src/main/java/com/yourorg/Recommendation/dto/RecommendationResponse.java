package com.yourorg.Recommendation.dto;

public record RecommendationResponse(
        Long id,
        Long subscriptionId,
        String providerName,
        String type,
        String reason,
        Double confidenceScore,
        String status,
        Integer monthlyUsageMinutes,
        Double currentMonthlyCost,
        Double suggestedMonthlyCost,
        Double potentialSavings
) {
}
