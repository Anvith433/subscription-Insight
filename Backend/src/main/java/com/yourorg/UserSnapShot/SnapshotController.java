package com.yourorg.UserSnapShot;

import com.yourorg.UserSnapShot.dto.SnapshotResponse;
import com.yourorg.Users.CurrentUserService;
import com.yourorg.Users.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/snapshots")
public class SnapshotController {

    private final UserSnapshotRepository userSnapshotRepository;
    private final CurrentUserService currentUserService;

    public SnapshotController(UserSnapshotRepository userSnapshotRepository, CurrentUserService currentUserService) {
        this.userSnapshotRepository = userSnapshotRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<SnapshotResponse> getHistory() {
        User user = currentUserService.getCurrentUser();
        return userSnapshotRepository.findAllBySubscriptionUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/latest")
    public SnapshotResponse getLatest() {
        User user = currentUserService.getCurrentUser();
        return userSnapshotRepository.findTopBySubscriptionUserIdOrderByCreatedAtDesc(user.getId())
                .map(this::toResponse)
                .orElse(null);
    }

    private SnapshotResponse toResponse(UserSnapShots snapshot) {
        return new SnapshotResponse(
                snapshot.getId(),
                snapshot.getSubscription() == null ? null : snapshot.getSubscription().getId(),
                snapshot.getSubscription() == null ? null : snapshot.getSubscription().getProviderName(),
                snapshot.getPeriod(),
                snapshot.getUsageCount(),
                snapshot.getLastUsedAt(),
                snapshot.getSource() == null ? null : snapshot.getSource().name(),
                snapshot.getCreatedAt()
        );
    }
}
