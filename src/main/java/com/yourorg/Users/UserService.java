package com.yourorg.Users;
import org.springframework.stereotype.Service;
import com.yourorg.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

   Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    Optional<User> findByUserName(String userName) {
        return userRepository.findByUserName(userName);
    }

    User save(User user) {
        return userRepository.save(user);
    }

    User deleteById(int id) {
        return userRepository.deleteById(id);
    }

     User findById(long id) {
        return userRepository.findById(id);
    }


   
}
