package com.yourorg.UserSnapShot;
import org.springframework.stereotype.Repository;
import com.yourorg.Subscriptions.Subscription;
import java.util.Optional;
@Repository
public interface UserSnapShotRepository
{

Optional<UserSnapShots> findBySubscriptionAndPeriod(
    Subscription subscription,
    String period
);
void save(UserSnapShots snapShot);
}