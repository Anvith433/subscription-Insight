package com.yourorg.Subscriptions;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserId(Long userId);
    Optional<Subscription> findByUserIdAndPackageName(Long userId, String packageName);
   Optional<Subscription> findByUserIdAndProviderNameIgnoreCase(Long userId, String providerName);
}