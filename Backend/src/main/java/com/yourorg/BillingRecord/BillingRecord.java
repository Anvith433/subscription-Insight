package com.yourorg.BillingRecord;
import jakarta.persistence.*;
<<<<<<< HEAD
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.common.DataSource;
import java.math.BigDecimal;
=======
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.yourorg.Subscriptions.Subscription;
>>>>>>> 75be6cf (Subscription-analytics)
import java.time.Instant;

@Entity
@Table(name="billing_records")
<<<<<<< HEAD
 

public class BillingRecord { 
=======
@Data
@Getter
@Setter
@AllArgsConstructor 
@NoArgsConstructor
public class BillingRecord {

>>>>>>> 75be6cf (Subscription-analytics)
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private long id;


<<<<<<< HEAD
    @Column(name="amount",precision=10, scale=2)
    private BigDecimal amount;
=======
    @Column(name="amount")
    private  Double amount;
>>>>>>> 75be6cf (Subscription-analytics)

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="subscription_id", nullable=false)
    private Subscription subscription;

    @Column(length=3, nullable=false)
    private String currency;

    @Column(name="billing_period", nullable=false, length=7)
<<<<<<< HEAD
    private String billingPeriod; 
=======
    private String billingPeriod;
>>>>>>> 75be6cf (Subscription-analytics)

    @Column(name="paid_at", nullable=false)
    private Instant paidAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
<<<<<<< HEAD
    private DataSource source;

    @Column(name="created_at", nullable=false, updatable=false)
    private Instant createdAt;

   public BillingRecord(){}

    public BillingRecord(long id , BigDecimal amount,Subscription subscription, String currency, String billingPeriod, Instant paidAt,PaymentMethod paymentMethod, DataSource source) {
        this.id = id;
        this.subscription = subscription;
        this.amount = amount;
        this.currency = currency;
        this.billingPeriod = billingPeriod;
        this.paidAt = paidAt;
        this.paymentMethod = paymentMethod;
        this.source = source;
        this.createdAt = Instant.now();
    }
    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    public Subscription getSubscription() {
        return subscription;
    }
    public void setSubscription(Subscription subscription) {
        this.subscription = subscription;
    }
    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public String getBillingPeriod() {
        return billingPeriod;
    }
    public void setBillingPeriod(String billingPeriod) {
        this.billingPeriod = billingPeriod;
    }
    public Instant getPaidAt() {
        return paidAt;
    }
    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    public DataSource getSource() {
        return source;
    }
    public void setSource(DataSource source) {
        this.source = source;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    
=======
    private Source source;

    @Column(name="created_at", nullable=false, updatable=false)
    private Instant createdAt;
>>>>>>> 75be6cf (Subscription-analytics)
    
}
