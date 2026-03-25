package com.yourorg.BillingRecord;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.*;
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.common.DataSource;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name="billing_records")
@Data
@Getter
@Setter
@AllArgsConstructor 
@NoArgsConstructor
public class BillingRecord {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private long id;


    @Column(name="amount",precision=10, scale=2)
    private BigDecimal amount;

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="subscription_id", nullable=false)
    private Subscription subscription;

    @Column(length=3, nullable=false)
    private String currency;

    @Column(name="billing_period", nullable=false, length=7)
    private String billingPeriod; // Format: "YYYY-MM"

    @Column(name="paid_at", nullable=false)
    private Instant paidAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private DataSource source;

    @Column(name="created_at", nullable=false, updatable=false)
    private Instant createdAt;
    
}
