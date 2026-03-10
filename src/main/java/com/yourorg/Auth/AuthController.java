package com.yourorg.Auth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.yourorg.Config.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired 
    private JwtService jwtService;

    @PostMapping("/login")
    public String login(@RequestBody AuthRequestDTO authRequest) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        String token = jwtService.generateToken(authRequest.getUsername());
        return new AuthResponseDTO(token, authRequest.getUsername()).toString();
    }
}
