package com.yourorg.UsageTracking;

import com.yourorg.UsageTracking.dto.MonthlyUsageResponse;
import com.yourorg.UsageTracking.dto.SupportedServiceResponse;
import com.yourorg.UsageTracking.dto.UsageTrackingRequest;
import com.yourorg.UsageTracking.dto.UsageTrackingResponse;
import com.yourorg.Users.CurrentUserService;
import com.yourorg.Users.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UsageTrackingService {

    private final UsageTrackingRepository usageTrackingRepository;
    private final CurrentUserService currentUserService;
    private final SupportedServiceRepository supportedServiceRepository;

    public UsageTrackingService(
            UsageTrackingRepository usageTrackingRepository,
            CurrentUserService currentUserService,
            SupportedServiceRepository supportedServiceRepository
    ) {
        this.usageTrackingRepository = usageTrackingRepository;
        this.currentUserService = currentUserService;
        this.supportedServiceRepository = supportedServiceRepository;
    }

    @Transactional
    public UsageTrackingResponse createUsageEntry(UsageTrackingRequest request) {
        validateRequest(request);

        User currentUser = currentUserService.getCurrentUser();

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            UsageTracking existing = usageTrackingRepository
                    .findByUserIdAndIdempotencyKey(currentUser.getId(), request.idempotencyKey())
                    .orElse(null);
            if (existing != null) {
                return toResponse(existing);
            }
        }

        UsageTracking usageTracking = new UsageTracking(
                currentUser,
                request.serviceName().trim(),
                request.date(),
                request.minutesUsed(),
                request.idempotencyKey() == null ? null : request.idempotencyKey().trim()
        );

        UsageTracking saved = usageTrackingRepository.save(usageTracking);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MonthlyUsageResponse> getMonthlyUsage(Integer year, Integer month) {
        User user = currentUserService.getCurrentUser();
        YearMonth yearMonth = resolveYearMonth(year, month);

        Map<String, Integer> usageByService = getMonthlyUsageMap(user.getId(), yearMonth);
        return usageByService.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .map(entry -> new MonthlyUsageResponse(entry.getKey(), entry.getValue(), yearMonth.getYear(), yearMonth.getMonthValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getMonthlyUsageMap(Long userId, YearMonth yearMonth) {
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Object[]> rows = usageTrackingRepository.aggregateUsageByService(userId, startDate, endDate);
        Map<String, Integer> usageByService = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String serviceName = row[0] == null ? "UNKNOWN" : row[0].toString();
            Number totalMinutes = (Number) row[1];
            usageByService.put(serviceName, totalMinutes == null ? 0 : totalMinutes.intValue());
        }
        return usageByService;
    }

    @Transactional(readOnly = true)
    public List<SupportedServiceResponse> getSupportedServices() {
        return supportedServiceRepository.findAllByIsActiveTrueOrderByProviderNameAsc()
                .stream()
                .map(s -> new SupportedServiceResponse(s.getProviderName(), s.getHost()))
                .toList();
    }

    private UsageTrackingResponse toResponse(UsageTracking usageTracking) {
        return new UsageTrackingResponse(
                usageTracking.getId(),
                usageTracking.getUser().getId(),
                usageTracking.getServiceName(),
                usageTracking.getMinutesUsed(),
                usageTracking.getDate(),
                usageTracking.getCreatedAt()
        );
    }

    private void validateRequest(UsageTrackingRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.serviceName() == null || request.serviceName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serviceName is required");
        }
        if (request.minutesUsed() == null || request.minutesUsed() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minutesUsed must be greater than 0");
        }
        if (request.date() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        if (request.date().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date cannot be in the future");
        }
        if (request.idempotencyKey() == null || request.idempotencyKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "idempotencyKey is required");
        }
    }

    private YearMonth resolveYearMonth(Integer year, Integer month) {
        if (year == null && month == null) {
            return YearMonth.now();
        }
        if (year == null || month == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both year and month must be provided together");
        }
        if (month < 1 || month > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month must be in the range 1..12");
        }
        return YearMonth.of(year, month);
    }

    public static String normalizeServiceName(String serviceName) {
        if (serviceName == null) {
            return "";
        }
        return serviceName.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }
}
