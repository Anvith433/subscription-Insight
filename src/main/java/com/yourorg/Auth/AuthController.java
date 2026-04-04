package com.yourorg.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.yourorg.Config.JwtService;
import com.yourorg.Users.User; // Ensure this points to your User entity
import com.yourorg.Users.UserRepository; // Ensure this points to your Repository
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired 
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

   
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO signupRequest) {
    
        if (userRepository.findByUserName(signupRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

     
        User user = new User();
        user.setUserName(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassWordHash(passwordEncoder.encode(signupRequest.getPassword()));
        
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

   
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {
      
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

      
        String token = jwtService.generateToken(authRequest.getUsername());

        
        return ResponseEntity.ok(new AuthResponseDTO(token, authRequest.getUsername()));
    }
}