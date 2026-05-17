package com.yourorg.Subscriptions.dto;

import java.math.BigDecimal;
import java.util.List;

public record UploadCsvResponse(
        List<DetectedItem> detected,
        Integer imported,
        List<String> errors,
        String fileUrl
) {
    public record DetectedItem(
            String providerName,
            String merchant,
            String description,
            String category,
            String date,
            BigDecimal amount,
            Boolean imported
    ) {
    }
}
