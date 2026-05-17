package com.yourorg.UsageTracking;

import com.yourorg.UsageTracking.dto.MonthlyUsageResponse;
import com.yourorg.UsageTracking.dto.SupportedServiceResponse;
import com.yourorg.UsageTracking.dto.UsageTrackingRequest;
import com.yourorg.UsageTracking.dto.UsageTrackingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usage")
public class UsageTrackingController {

    private final UsageTrackingService usageTrackingService;

    public UsageTrackingController(UsageTrackingService usageTrackingService) {
        this.usageTrackingService = usageTrackingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsageTrackingResponse createUsageEntry(@RequestBody UsageTrackingRequest request) {
        return usageTrackingService.createUsageEntry(request);
    }

    @GetMapping("/monthly")
    public List<MonthlyUsageResponse> getMonthlyUsage(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return usageTrackingService.getMonthlyUsage(year, month);
    }

    @GetMapping("/config")
    public List<SupportedServiceResponse> getSupportedServices() {
        return usageTrackingService.getSupportedServices();
    }
}
