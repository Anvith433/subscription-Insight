package com.yourorg.UsageTracking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsageTrackingRepository extends JpaRepository<UsageTracking, Long> {

  Optional<UsageTracking> findByUserIdAndIdempotencyKey(Long userId, String idempotencyKey);

    @Query("""
            select u.serviceName, sum(u.minutesUsed)
            from UsageTracking u
            where u.user.id = :userId
              and u.date between :startDate and :endDate
            group by u.serviceName
            """)
    List<Object[]> aggregateUsageByService(Long userId, LocalDate startDate, LocalDate endDate);
}
