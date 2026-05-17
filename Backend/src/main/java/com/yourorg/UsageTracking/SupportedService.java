package com.yourorg.UsageTracking;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "supported_services")
public class SupportedService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_name", nullable = false, length = 255)
    private String providerName;

    @Column(name = "host", nullable = false, length = 255, unique = true)
    private String host;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getHost() {
        return host;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
