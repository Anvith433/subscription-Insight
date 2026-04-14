package com.yourorg.BillingRecord;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.yourorg.BillingRecord.BillingRecordRepository;
import com.yourorg.Subscriptions.Subscription;
import com.yourorg.Subscriptions.SubscriptionRepository;

@Service
public class BillingRecordService {

    @Autowired
    private SubscriptionRepository subscriptionRepo;
    
    @Autowired
    private BillingRecordRepository billingRecordRepository;

    public BillingRecord save(BillingRecord billingRecord) {
        return billingRecordRepository.save(billingRecord);
    }
public void createBill(Subscription sub, String period) {
        if (!billingRecordRepository.existsBySubscriptionIdAndBillingPeriod(sub.getId(), period)) {
            
            BillingRecord newBill = new BillingRecord();
            newBill.setSubscription(sub);
            newBill.setAmount(sub.getPrice());
            newBill.setBillingPeriod(period);
            billingRecordRepository.save(newBill); 
        }
}
}
