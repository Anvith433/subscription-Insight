package com.yourorg.UserSnapShot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.yourorg.Subscriptions.SubscriptionService;

@RestController
public class UsageController {

    @Autowired 
    private SubscriptionService subscriptionService;
    
  @PutMapping("/usage")
public ResponseEntity<String> updateUsage(@RequestBody UsageRequest request) {
    try {
        for (AppUsageDTO app : request.getApps()) {
            // Pass the period (TODAY/WEEK/MONTH) if your Android library provides it
            // Otherwise, the service will default to today's date
            subscriptionService.syncUsageAndBilling(
                request.getUserId(), 
                app.getAppName(), 
                app.getUsageMinutes()
            );
        }
        return ResponseEntity.ok("Usage synced successfully");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
}




    
}
