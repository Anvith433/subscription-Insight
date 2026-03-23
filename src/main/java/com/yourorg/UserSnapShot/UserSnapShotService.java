package com.yourorg.UserSnapShot;

import java.time.Instant;
import java.time.YearMonth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.Subscriptions.SubscriptionRepository;

public class UserSnapShotService {
    

    @Service
public class UsageService {

    @Autowired
    private SubscriptionRepository subscriptionRepo;

    @Autowired
    private UserSnapShotRepository snapshotRepo;

    public void processUsage(UsageRequest request) {

        for (AppUsageDTO app : request.getApps()) {

           
            Subscription sub = subscriptionRepo
                .findByUserIdAndProviderName(
                    request.getUserId(),
                    app.getAppName()
                )
                .orElse(null);


          
            String period = YearMonth.now().toString();

           
            UserSnapShots snapshot =
                snapshotRepo.findBySubscriptionAndPeriod(sub, period)
                .orElseGet(() -> {
                    UserSnapShots s = new UserSnapShots();
                    s.setSubscription(sub);
                    s.setPeriod(period);
                    s.setUsageCount(0);
                    return s;
                });

           
            snapshot.setUsageCount(
                snapshot.getUsageCount() + app.getUsageMinutes()
            );

            snapshot.setLastUsedAt(Instant.now());
            snapshot.setSource(UsageSource.ANDROID);

            snapshotRepo.save(snapshot);
        }
    }
}
}
