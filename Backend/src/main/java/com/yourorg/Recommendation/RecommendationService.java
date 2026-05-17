package com.yourorg.Recommendation;

import com.yourorg.Recommendation.dto.RecommendationResponse;
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.Subscriptions.SubscriptionRepository;
import com.yourorg.Subscriptions.Renewal_Cycle;
import com.yourorg.Subscriptions.SubscriptionStatus;
import com.yourorg.UsageTracking.SupportedService;
import com.yourorg.UsageTracking.SupportedServiceRepository;
import com.yourorg.UsageTracking.UsageTrackingService;
import com.yourorg.Users.CurrentUserService;
import com.yourorg.Users.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class RecommendationService {

    private static final int DOWNGRADE_THRESHOLD_MINUTES = 60;

    private final RecommendationRepository recommendationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProviderPlanTierRepository providerPlanTierRepository;
    private final SupportedServiceRepository supportedServiceRepository;
    private final CurrentUserService currentUserService;
    private final UsageTrackingService usageTrackingService;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            SubscriptionRepository subscriptionRepository,
            ProviderPlanTierRepository providerPlanTierRepository,
            SupportedServiceRepository supportedServiceRepository,
            CurrentUserService currentUserService,
            UsageTrackingService usageTrackingService
    ) {
        this.recommendationRepository = recommendationRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.providerPlanTierRepository = providerPlanTierRepository;
        this.supportedServiceRepository = supportedServiceRepository;
        this.currentUserService = currentUserService;
        this.usageTrackingService = usageTrackingService;
    }

    @Transactional
    public List<RecommendationResponse> getAll() {
        User user = currentUserService.getCurrentUser();
        Map<Long, RecommendationInsight> insightsBySubscriptionId = refreshGeneratedRecommendations(user);
        List<Recommendation> existing = recommendationRepository.findAllByUserIdOrderByGeneratedAtDesc(user.getId());

        return existing.stream()
                .filter(r -> r.getStatus() != Status.DISMISSED)
                .map(r -> toResponse(r, insightsBySubscriptionId))
                .toList();
    }

    @Transactional
    public RecommendationResponse dismiss(Long id) {
        User user = currentUserService.getCurrentUser();
        Recommendation recommendation = recommendationRepository.findById(id)
                .filter(r -> Objects.equals(r.getUser().getId(), user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recommendation not found"));

        recommendation.setStatus(Status.DISMISSED);
        Recommendation saved = recommendationRepository.save(recommendation);
        Map<Long, RecommendationInsight> insightsBySubscriptionId = buildInsightsBySubscription(user);
        return toResponse(saved, insightsBySubscriptionId);
    }

    private Map<Long, RecommendationInsight> refreshGeneratedRecommendations(User user) {
        recommendationRepository.deleteByUserIdAndStatusNot(user.getId(), Status.DISMISSED);

        List<Subscription> subscriptions = subscriptionRepository.findAllByUserId(user.getId());
        List<Recommendation> generated = new ArrayList<>();
        Map<Long, RecommendationInsight> insightsBySubscriptionId = buildInsightsBySubscription(user, subscriptions);

        for (Subscription sub : subscriptions) {
            if (sub.getStatus() != SubscriptionStatus.Active) {
                continue;
            }

            RecommendationInsight insight = insightsBySubscriptionId.get(sub.getId());
            if (insight == null) {
                continue;
            }

            Recommendation recommendation = new Recommendation();
            recommendation.setUser(user);
            recommendation.setSubscription(sub);
            recommendation.setStatus(Status.NEW);
            recommendation.setGeneratedAt(Instant.now());

            recommendation.setType(insight.type());
            recommendation.setReason(insight.reason());
            recommendation.setConfidenceScore(insight.confidenceScore());

            generated.add(recommendation);
        }

        if (!generated.isEmpty()) {
            recommendationRepository.saveAll(generated);
        }

        return insightsBySubscriptionId;
    }

    private Map<Long, RecommendationInsight> buildInsightsBySubscription(User user) {
        List<Subscription> subscriptions = subscriptionRepository.findAllByUserId(user.getId());
        return buildInsightsBySubscription(user, subscriptions);
    }

    private Map<Long, RecommendationInsight> buildInsightsBySubscription(User user, List<Subscription> subscriptions) {
        YearMonth currentMonth = YearMonth.now();
        Map<String, Integer> rawUsage = usageTrackingService.getMonthlyUsageMap(user.getId(), currentMonth);
        Map<String, Integer> normalizedUsage = normalizeUsageMap(rawUsage);
        List<SupportedService> supportedServices = supportedServiceRepository.findAllByIsActiveTrueOrderByProviderNameAsc();
        Map<String, Set<String>> providerAliases = buildProviderAliases(supportedServices);

        Map<Long, RecommendationInsight> insightsBySubscriptionId = new HashMap<>();

        for (Subscription sub : subscriptions) {
            if (sub.getStatus() != SubscriptionStatus.Active) {
                continue;
            }

            String providerName = sub.getProviderName() == null ? "Unknown" : sub.getProviderName().trim();
            String canonicalProvider = resolveCanonicalProvider(providerName, providerAliases);
            int monthlyUsageMinutes = findUsageForService(canonicalProvider, normalizedUsage, providerAliases);

            double currentMonthlyCost = calculateMonthlyCost(sub);
            double suggestedMonthlyCost = currentMonthlyCost;
            double potentialSavings = 0.0;
            Type type;
            String reason;
            double confidenceScore;

            if (monthlyUsageMinutes == 0) {
                type = Type.CANCEL;
                suggestedMonthlyCost = 0.0;
                potentialSavings = currentMonthlyCost;
                reason = "No usage tracked this month. Cancel to save " + formatCurrency(currentMonthlyCost) + "/month.";
                confidenceScore = 0.93;
            } else if (monthlyUsageMinutes < DOWNGRADE_THRESHOLD_MINUTES) {
                Double downgradePrice = findDowngradePrice(canonicalProvider, currentMonthlyCost);
                if (downgradePrice != null) {
                    type = Type.DOWNGRADE;
                    suggestedMonthlyCost = downgradePrice;
                    potentialSavings = round2(Math.max(0.0, currentMonthlyCost - suggestedMonthlyCost));
                    reason = "Low usage (" + monthlyUsageMinutes + " min this month). Downgrade plan to save " + formatCurrency(potentialSavings) + "/month.";
                    confidenceScore = 0.81;
                } else {
                    type = Type.KEEP;
                    reason = "Low usage, but no lower-tier plan data is available for this provider.";
                    confidenceScore = 0.62;
                }
            } else {
                type = Type.KEEP;
                reason = "Healthy usage (" + monthlyUsageMinutes + " min this month). Current plan looks justified.";
                confidenceScore = 0.86;
            }

            insightsBySubscriptionId.put(
                    sub.getId(),
                    new RecommendationInsight(
                            canonicalProvider,
                            type,
                            reason,
                            confidenceScore,
                            monthlyUsageMinutes,
                            round2(currentMonthlyCost),
                            round2(suggestedMonthlyCost),
                            round2(potentialSavings)
                    )
            );
        }

        return insightsBySubscriptionId;
    }

    private RecommendationResponse toResponse(Recommendation recommendation, Map<Long, RecommendationInsight> insightsBySubscriptionId) {
        RecommendationInsight insight = recommendation.getSubscription() == null
                ? null
                : insightsBySubscriptionId.get(recommendation.getSubscription().getId());

        return new RecommendationResponse(
                recommendation.getId(),
                recommendation.getSubscription() == null ? null : recommendation.getSubscription().getId(),
                insight == null ? null : insight.providerName(),
                recommendation.getType() == null ? null : recommendation.getType().name(),
                insight == null ? recommendation.getReason() : insight.reason(),
                insight == null ? recommendation.getConfidenceScore() : insight.confidenceScore(),
                recommendation.getStatus() == null ? null : recommendation.getStatus().name(),
                insight == null ? 0 : insight.monthlyUsageMinutes(),
                insight == null ? 0.0 : insight.currentMonthlyCost(),
                insight == null ? 0.0 : insight.suggestedMonthlyCost(),
                insight == null ? 0.0 : insight.potentialSavings()
        );
    }

    private Map<String, Integer> normalizeUsageMap(Map<String, Integer> rawUsage) {
        Map<String, Integer> normalized = new HashMap<>();
        for (Map.Entry<String, Integer> entry : rawUsage.entrySet()) {
            String normalizedName = UsageTrackingService.normalizeServiceName(entry.getKey());
            int minutes = entry.getValue() == null ? 0 : entry.getValue();
            normalized.put(normalizedName, normalized.getOrDefault(normalizedName, 0) + minutes);
        }
        return normalized;
    }

    private int findUsageForService(String canonicalProvider, Map<String, Integer> normalizedUsage, Map<String, Set<String>> providerAliases) {
        Set<String> aliases = providerAliases.getOrDefault(canonicalProvider, Set.of(canonicalProvider));
        int bestMatch = 0;

        for (String alias : aliases) {
            String normalizedProvider = UsageTrackingService.normalizeServiceName(alias);
            if (normalizedProvider.isBlank()) {
                continue;
            }

            Integer exact = normalizedUsage.get(normalizedProvider);
            if (exact != null) {
                bestMatch = Math.max(bestMatch, exact);
                continue;
            }

            for (Map.Entry<String, Integer> entry : normalizedUsage.entrySet()) {
                String usageKey = entry.getKey();
                if (usageKey.contains(normalizedProvider) || normalizedProvider.contains(usageKey)) {
                    bestMatch = Math.max(bestMatch, entry.getValue());
                }
            }
        }

        return bestMatch;
    }

    private String resolveCanonicalProvider(String providerName, Map<String, Set<String>> providerAliases) {
        String normalizedProvider = UsageTrackingService.normalizeServiceName(providerName);
        if (normalizedProvider.isBlank()) {
            return providerName;
        }

        for (Map.Entry<String, Set<String>> entry : providerAliases.entrySet()) {
            for (String alias : entry.getValue()) {
                String normalizedAlias = UsageTrackingService.normalizeServiceName(alias);
                if (normalizedAlias.equals(normalizedProvider)
                        || normalizedAlias.contains(normalizedProvider)
                        || normalizedProvider.contains(normalizedAlias)) {
                    return entry.getKey();
                }
            }
        }

        return providerName;
    }

    private Map<String, Set<String>> buildProviderAliases(List<SupportedService> supportedServices) {
        Map<String, Set<String>> map = new HashMap<>();
        for (SupportedService service : supportedServices) {
            map.computeIfAbsent(service.getProviderName(), ignored -> new HashSet<>()).add(service.getProviderName());
            map.computeIfAbsent(service.getProviderName(), ignored -> new HashSet<>()).add(service.getHost());
        }
        return map;
    }

    private Double findDowngradePrice(String providerName, double currentMonthlyCost) {
        List<ProviderPlanTier> tiers = providerPlanTierRepository.findAllByProviderNameIgnoreCaseOrderBySortOrderAsc(providerName);
        if (tiers.isEmpty()) {
            return null;
        }

        Double candidate = null;
        for (ProviderPlanTier tier : tiers) {
            if (tier.getMonthlyPrice() == null) {
                continue;
            }
            double price = tier.getMonthlyPrice().doubleValue();
            if (price < currentMonthlyCost) {
                candidate = price;
            }
        }

        return candidate == null ? null : round2(candidate);
    }

    private double calculateMonthlyCost(Subscription subscription) {
        if (subscription.getPrice() == null) {
            return 0.0;
        }

        double price = subscription.getPrice().doubleValue();
        Renewal_Cycle cycle = subscription.getRenewalCycle();
        if (cycle == null) {
            return price;
        }

        return switch (cycle) {
            case WEEKLY -> round2((price * 52) / 12.0);
            case YEARLY -> round2(price / 12.0);
            default -> round2(price);
        };
    }

    private String formatCurrency(double value) {
        return String.format(Locale.ROOT, "%.2f", round2(value));
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record RecommendationInsight(
            String providerName,
            Type type,
            String reason,
            Double confidenceScore,
            Integer monthlyUsageMinutes,
            Double currentMonthlyCost,
            Double suggestedMonthlyCost,
            Double potentialSavings
    ) {
    }
}
