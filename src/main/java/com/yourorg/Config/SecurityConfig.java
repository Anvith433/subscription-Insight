package com.yourorg.Config;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.yourorg.Users.CustomUserDetailsService;
import com.yourorg.Config.JwtAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

@Configuration 
@EnableWebSecurity
public class SecurityConfig {

      @Autowired 
    private UserDetailsService userDetailsService;


    @Autowired 
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain filter (HttpSecurity http) throws Exception{
     http
    .csrf(customizer -> customizer.disable())
    .authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/**").permitAll()
    .requestMatchers("/admin").hasRole("ADMIN")
    .requestMatchers("/user").hasAnyRole("USER", "ADMIN")
    .anyRequest().authenticated()
)
    .formLogin(form -> form.disable())
    .sessionManagement(session ->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    )
    .authenticationProvider(authenticationProvider)
    .addFilterBefore(jwtAuthFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
    return http.build();
    
    }

    @Bean 
    public PasswordEncoder passwordEncoder()
    {
        return new BCryptPasswordEncoder();
    }
    
   
}

    
    

