package com.yourorg.Recommendation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.yourorg.Users.User;
import com.yourorg.Subscriptions.Subscription;
import java.time.Instant;
import java.math.BigDecimal;
@Entity
@Table(name="recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private long id;

   @ManyToOne(fetch=FetchType.LAZY, optional=false)
   @JoinColumn(name="user_id", nullable=false)
   private User user;

   @ManyToOne(fetch=FetchType.LAZY, optional=false)
   @JoinColumn(name="subscription_id", nullable=false)
   private Subscription subscription;

   @Enumerated(EnumType.STRING) 
   @Column(name="type", nullable=false)
   private Type type;

   @Column(name="reason", length=100)
   private String reason;

   @Column(name="confidence_score", precision=10, scale=2)
   private BigDecimal confidenceScore;

   @Enumerated(EnumType.STRING)
   @Column(name="status", nullable=false)
   private Status status;

   @Column(name="generated_at", nullable=false)
   private Instant generated_at;
    
}
