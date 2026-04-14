package com.yourorg.Config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;
import java.util.logging.Logger;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired 
    private JwtService jwtService;

    @Autowired 
    private UserDetailsService userDetailsService;

    @Override 
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {

            String path = request.getServletPath();
        if (path.contains("/api/signup/**") || path.contains("/api/login/**")) {
            filterChain.doFilter(request, response);
            return; 
        }
            String authHeader=request.getHeader("Authorization");
            String jwtToken=null;
            String username=null;

          
        if (authHeader != null && authHeader.startsWith("Bearer ")) 
            {
            jwtToken = authHeader.substring(7);
            try
             {
                username = jwtService.extractUsername(jwtToken);
            } catch (Exception e)
             {
               
                Logger.getLogger(JwtAuthenticationFilter.class.getName()).severe("JWT extraction failed: " + e.getMessage());
            }
        }
            if(username!=null && SecurityContextHolder.getContext().getAuthentication()==null)
            {
                UserDetails userDetails=userDetailsService.loadUserByUsername(username);
                if(jwtService.validateToken(jwtToken, userDetails))
                {
                    UsernamePasswordAuthenticationToken authToken= new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                   SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        }
    
}
    

