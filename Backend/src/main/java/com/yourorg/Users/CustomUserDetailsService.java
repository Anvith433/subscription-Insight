package com.yourorg.Users;
<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

=======
import com.yourorg.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User.UserBuilder;

@Service
public class CustomUserDetailsService implements UserDetailsService {
>>>>>>> 75be6cf (Subscription-analytics)
    @Autowired
    private UserRepository userRepository;

    @Override
<<<<<<< HEAD
    public UserDetails loadUserByUsername(String loginInput) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(loginInput)
                .orElseGet(() -> userRepository.findByUserName(loginInput)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with: " + loginInput)));

      
        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPassWordHash())
                .authorities("USER") 
                .build();
    }
}
=======
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        UserBuilder builder = org.springframework.security.core.userdetails.User.withUsername(username);
        builder.password(user.getPassWordHash());
        builder.roles("USER"); // You can set roles based on your requirements

        return builder.build();
    }


    
}
>>>>>>> 75be6cf (Subscription-analytics)
