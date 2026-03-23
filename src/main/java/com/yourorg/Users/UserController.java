package com.yourorg.Users;
import com.yourorg.Users.UserRepository;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.yourorg.Users.User;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable long id) {
        return userService.findById(id);
    }
    @GetMapping("/users/email/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userService.findByEmail(email).orElse(null);
    }

    @GetMapping("/users/username/{username}")
    public User getUserByUserName(@PathVariable String username) {
        return userService.findByUserName(username).orElse(null);
    }
    

}

