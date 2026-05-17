package com.yourorg.BillingRecord;

import com.yourorg.BillingRecord.dto.BillingResponse;
import com.yourorg.Users.CurrentUserService;
import com.yourorg.Users.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingRecordRepository billingRecordRepository;
    private final CurrentUserService currentUserService;

    public BillingController(BillingRecordRepository billingRecordRepository, CurrentUserService currentUserService) {
        this.billingRecordRepository = billingRecordRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<BillingResponse> getAll() {
        User user = currentUserService.getCurrentUser();
        return billingRecordRepository.findAllBySubscriptionUserIdOrderByPaidAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/upcoming")
    public List<BillingResponse> getUpcoming() {
        User user = currentUserService.getCurrentUser();
        Instant now = Instant.now();
        Instant future = now.plus(30, ChronoUnit.DAYS);

        return billingRecordRepository.findAllBySubscriptionUserIdAndPaidAtAfterOrderByPaidAtAsc(user.getId(), now)
                .stream()
                .filter(b -> b.getPaidAt() != null && b.getPaidAt().isBefore(future))
                .map(this::toResponse)
                .toList();
    }

    private BillingResponse toResponse(BillingRecord record) {
        return new BillingResponse(
                record.getId(),
                record.getSubscription() == null ? null : record.getSubscription().getId(),
                record.getSubscription() == null ? null : record.getSubscription().getProviderName(),
                record.getAmount(),
                record.getCurrency(),
                record.getBillingPeriod(),
                record.getPaidAt(),
                record.getPaymentMethod() == null ? null : record.getPaymentMethod().name(),
                record.getSource() == null ? null : record.getSource().name(),
                record.getCreatedAt()
        );
    }
}
