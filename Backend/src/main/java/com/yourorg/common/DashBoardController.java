package com.yourorg.common;
import org.springframework.beans.factory.annotation.Autowired;
import com.yourorg.Subscriptions.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashBoardController {

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * This endpoint provides the full data for the Android Dashboard.
     * It combines Subscription details, Usage counts, and AI Recommendations.
     * * URL: GET http://localhost:8080/api/dashboard/{userId}
     * 
     * 
     */

            @GetMapping("{userId}")
public List<DashBoardResponseDTO> getDashboardData(
    @PathVariable Long userId,
    @RequestParam(name = "period", defaultValue = "TODAY") String period
) {
    return subscriptionService.getUserDashboard(userId, period);
}


 
}