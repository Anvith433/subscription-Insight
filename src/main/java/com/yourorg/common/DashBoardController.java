package com.yourorg.common;
import org.springframework.beans.factory.annotation.Autowired;
import com.yourorg.Subscriptions.SubscriptionService;
import com.yourorg.common.DashBoardResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<DashBoardResponseDTO>> getDashboardData(@PathVariable Long userId) {
        List<DashBoardResponseDTO> dashboard = subscriptionService.getUserDashboard(userId);
        
        if (dashboard.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(dashboard);
    }
}