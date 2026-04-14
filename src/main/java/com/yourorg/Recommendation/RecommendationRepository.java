package com.yourorg.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findBySubscriptionProviderName(String providerName);
    Optional<Recommendation> findById(long id);
     Optional<Recommendation> findByUserIdAndSubscriptionId(Long userId, Long subscriptionId);
    Recommendation deleteById(int id);


    
}
