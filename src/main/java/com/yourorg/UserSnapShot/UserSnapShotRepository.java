package com.yourorg.UserSnapShot;
import org.springframework.stereotype.Repository;
import com.yourorg.Subscriptions.Subscription;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserSnapShotRepository extends JpaRepository<UserSnapShots, Long> {

    Optional<UserSnapShots> findBySubscriptionAndPeriod(Subscription subscription, String period);

    @Query(value = "SELECT COALESCE(SUM(usage_count), 0) FROM user_snapshots " +
                   "WHERE subscription_id = :subId " +
                   "AND last_used_at >= DATE_SUB(NOW(), INTERVAL :days DAY)", 
           nativeQuery = true)
    Integer sumUsageByDays(@Param("subId") Long subId, @Param("days") int days);

}

