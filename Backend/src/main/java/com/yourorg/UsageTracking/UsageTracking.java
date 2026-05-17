package com.yourorg.UsageTracking;

import com.yourorg.Users.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "usage_tracking")
public class UsageTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "service_name", nullable = false, length = 255)
    private String serviceName;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "minutes_used", nullable = false)
    private Integer minutesUsed;

    @Column(name = "idempotency_key", length = 120)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected UsageTracking() {
    }

    public UsageTracking(User user, String serviceName, LocalDate date, Integer minutesUsed, String idempotencyKey) {
        this.user = user;
        this.serviceName = serviceName;
        this.date = date;
        this.minutesUsed = minutesUsed;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getServiceName() {
        return serviceName;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getMinutesUsed() {
        return minutesUsed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }
}
