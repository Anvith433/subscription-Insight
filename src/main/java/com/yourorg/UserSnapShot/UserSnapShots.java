package com.yourorg.UserSnapShot;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.common.DataSource;
@Entity
@Table(name="user_snapshots",
    uniqueConstraints = {
        @UniqueConstraint(  name = "uk_subscription_period",
            columnNames = {"subscription_id", "period"}
        )
    }
)


@Getter
@Setter

public class UserSnapShots {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(nullable = false, length = 7)
    private String period; // YYYY-MM

    @Column(nullable = false)
    private int usageCount;

    private Instant lastUsedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataSource source;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

public UserSnapShots(){}
   
public UserSnapShots(Subscription subscription, String period, int usageCount, DataSource source) {
    this.subscription = subscription;
    this.period = period;
    this.usageCount = usageCount;
    this.source = source;
}

}

