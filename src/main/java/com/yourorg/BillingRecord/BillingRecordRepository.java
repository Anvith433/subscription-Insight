package com.yourorg.BillingRecord;
import com.yourorg.BillingRecord.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {
    Optional<BillingRecord> findByTransactionId(String transactionId);
    boolean existsBySubscriptionIdAndBillingPeriod(Long subscriptionId, String billingPeriod);
    List<BillingRecord> findBySubscriptionUserId(Long userId);

    
}
