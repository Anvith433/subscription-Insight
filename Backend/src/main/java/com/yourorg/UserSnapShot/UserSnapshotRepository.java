package com.yourorg.UserSnapShot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSnapshotRepository extends JpaRepository<UserSnapShots, Long> {
    List<UserSnapShots> findAllBySubscriptionUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserSnapShots> findTopBySubscriptionUserIdOrderByCreatedAtDesc(Long userId);
}
