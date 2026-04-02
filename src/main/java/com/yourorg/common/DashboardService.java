package com.yourorg.common;

import com.yourorg.Subscriptions.Subscription;
import com.yourorg.Subscriptions.SubscriptionRepository;
import com.yourorg.UserSnapShot.UserSnapShotRepository;
import com.yourorg.UserSnapShot.UserSnapShots;
import com.yourorg.Recommendation.RecommendationRepository;
import com.yourorg.Recommendation.Recommendation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.YearMonth;
import java.util.stream.Collectors;



@Service
public class DashboardService {

    @Autowired
    private SubscriptionRepository subscriptionRepo;

    @Autowired
    private UserSnapShotRepository snapshotRepo;

    @Autowired
    private RecommendationRepository recommendationRepo;

    public List<DashBoardResponseDTO> getDashboardData(Long userId) {
        String currentPeriod = YearMonth.now().toString(); // e.g., "2026-04"

        // 1. Get all subscriptions for the user
        List<Subscription> subscriptions = subscriptionRepo.findByUserId(userId);

      // 2. Map each subscription to a Dashboard DTO
return subscriptions.stream()
    .<DashBoardResponseDTO>map(sub -> { // <--- Added Type Witness here
        // Find usage for this specific subscription this month
        UserSnapShots snapshot = snapshotRepo
            .findBySubscriptionAndPeriod(sub, currentPeriod)
            .orElse(null);

        // Find latest recommendation
        Recommendation rec = recommendationRepo
            .findByUserIdAndSubscriptionId(userId, sub.getId())
            .orElse(null);

        // Build the DTO
        return DashBoardResponseDTO.builder()
            .providerName(sub.getProviderName())
            .packageName(sub.getPackageName())
            .price(sub.getPrice())
            .currency(sub.getCurrency())
            .usageMinutes(snapshot != null ? snapshot.getUsageCount() : 0)
            .billingPeriod(currentPeriod)
            .recommendationType(rec != null ? rec.getType().name() : "PENDING")
            .reason(rec != null ? rec.getReason() : "Analyzing usage data...")
            .build();
    }).collect(Collectors.toList());
    }
}