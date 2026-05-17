package com.yourorg.Recommendation;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "provider_plan_tiers")
public class ProviderPlanTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_name", nullable = false, length = 255)
    private String providerName;

    @Column(name = "tier_name", nullable = false, length = 100)
    private String tierName;

    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getTierName() {
        return tierName;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
