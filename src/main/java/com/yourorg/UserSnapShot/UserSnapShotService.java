package com.yourorg.UserSnapShot;

import java.time.Instant;
import java.time.YearMonth;
import com.yourorg.common.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.Subscriptions.SubscriptionRepository;

@Service
public class UserSnapShotService {
    @Autowired
    private SubscriptionRepository subscriptionRepo;

    @Autowired
    private UserSnapShotRepository snapshotRepo;

    public void processUsage(UsageRequest request) {
    for (AppUsageDTO app : request.getApps()) {
        
       
        Subscription sub = subscriptionRepo.findByUserIdAndProviderNameIgnoreCase(request.getUserId(), app.getPackageName()) // Ensure field name matches Android
            .orElse(null);

       
        if (sub != null) { 
            String period = YearMonth.now().toString();

            UserSnapShots snapshot = snapshotRepo.findBySubscriptionAndPeriod(sub, period)
                .orElseGet(() -> {
                    UserSnapShots s = new UserSnapShots();
                    s.setSubscription(sub);
                    s.setPeriod(period);
                    s.setUsageCount(0);
                    return s;
                });

            snapshot.setUsageCount(snapshot.getUsageCount() + app.getUsageMinutes()); // Ensure field name matches Android
            snapshot.setLastUsedAt(Instant.now());
            snapshot.setSource(DataSource.ANDROID);

            snapshotRepo.save(snapshot);
        } else {
            // This app is not a subscription we track, so we just ignore it.
            System.out.println("Skipping non-tracked app: " + app.getPackageName());
        }
    }
}
}

