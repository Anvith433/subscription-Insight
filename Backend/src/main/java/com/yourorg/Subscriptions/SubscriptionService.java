package com.yourorg.Subscriptions;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yourorg.UserSnapShot.UserSnapShots;
import com.yourorg.UserSnapShot.UserSnapShotRepository;
import com.yourorg.BillingRecord.BillingRecord;
import com.yourorg.BillingRecord.BillingRecordRepository;
import com.yourorg.common.DataSource;
import com.yourorg.BillingRecord.PaymentMethod;
import com.yourorg.Recommendation.Recommendation;
import com.yourorg.Recommendation.RecommendationRepository;
import com.yourorg.common.DashBoardResponseDTO;

@Service
public class SubscriptionService {

    @Autowired private SubscriptionRepository subscriptionRepo;
    @Autowired private UserSnapShotRepository snapshotRepo;
    @Autowired private RecommendationRepository recommendationRepo;
   

    public void syncUsageAndBilling(Long userId, String appName, int usageMinutes) {
        // Find app ignoring case to prevent name mismatches
        Subscription sub = subscriptionRepo.findByUserIdAndProviderNameIgnoreCase(userId, appName)
                .orElseThrow(() -> new RuntimeException("App not in subscription list: " + appName));

        // Always save using Today's Date as the period
        String today = LocalDate.now().toString(); 

        UserSnapShots snapshot = snapshotRepo.findBySubscriptionAndPeriod(sub, today)
                .orElseGet(() -> {
                    UserSnapShots newSnapshot = new UserSnapShots();
                    newSnapshot.setSubscription(sub);
                    newSnapshot.setPeriod(today);
                    newSnapshot.setUsageCount(0);
                    newSnapshot.setSource(DataSource.ANDROID);
                    return newSnapshot;
                });

        // Update usage and set timestamp (CRITICAL for the SUM logic)
        snapshot.setUsageCount(usageMinutes); // Overwrite with latest sync for the day
        snapshot.setLastUsedAt(Instant.now());
        snapshotRepo.save(snapshot);
    }

    public List<DashBoardResponseDTO> getUserDashboard(Long userId, String fetchType) {
    List<Subscription> subscriptions = subscriptionRepo.findByUserId(userId);
    List<DashBoardResponseDTO> dashboardList = new ArrayList<>();

    // 1. Map the strings coming from your Android buttons
    int days = switch (fetchType.toUpperCase()) {
        case "TODAY" -> 1;
        case "WEEK"  -> 7;
        case "MONTH", "MONTHLY" -> 30; 
        default      -> 1;
    };

    for (Subscription sub : subscriptions) {
        // 2. Call the SUM query
        Integer total = snapshotRepo.sumUsageByDays(sub.getId(), days);
        
        // 3. Convert null to 0 just in case
        int usage = (total != null) ? total : 0;

        // 4. FILTER: "I do not need zero"
        if (usage > 0) {
            dashboardList.add(DashBoardResponseDTO.builder()
                    .providerName(sub.getProviderName())
                    .usageMinutes(usage)
                    .billingPeriod(fetchType.toUpperCase())
                    .recommendationType("PENDING")
                    .reason("Usage for the last " + days + " days")
                    .build());
        }
    }
    return dashboardList;
}
}