package com.yourorg.Subscriptions;
import com.yourorg.Users.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "provider_name", nullable = false, length = 255)
    private String providerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "renewal_cycle", nullable = false, length = 20)
    private Renewal_Cycle renewalCycle;

    @Column(name = "renewal_date", nullable = false)
    private LocalDate renewalDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 3, nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

   
    protected Subscription() {
        
    }

    public Subscription(
            User user,
            String providerName,
            Category category,
            LocalDate startDate,
            Renewal_Cycle renewalCycle,
            LocalDate renewalDate,
            BigDecimal price,
            String currency
    ) {
        this.user = user;
        this.providerName = providerName;
        this.category = category;
        this.startDate = startDate;
        this.renewalCycle = renewalCycle;
        this.renewalDate = renewalDate;
        this.price = price;
        this.currency = currency;
        this.status = SubscriptionStatus.Active;
        this.createdAt = Instant.now();
    }

    

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getProviderName() {
        return providerName;
    }

    public Category getCategory() {
        return category;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public Renewal_Cycle getRenewalCycle() {
        return renewalCycle;
    }

    public LocalDate getRenewalDate() {
        return renewalDate;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

   
    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setRenewalCycle(Renewal_Cycle renewalCycle) {
        this.renewalCycle = renewalCycle;
    }

    public void setRenewalDate(LocalDate renewalDate) {
        this.renewalDate = renewalDate;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
   public String getPackageName() {
        return providerName;
    }
    
}
