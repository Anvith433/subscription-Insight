package com.yourorg.Users;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserName(String userName);
<<<<<<< HEAD
    Optional<User> findById(long id);
  
    
=======
    Optional<User> findTopByOrderByIdAsc();
>>>>>>> 75be6cf (Subscription-analytics)
}
