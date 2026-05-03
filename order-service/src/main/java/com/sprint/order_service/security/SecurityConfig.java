package com.sprint.order_service.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS is handled exclusively by the API Gateway — do NOT add it here
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.GET, "/orders").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/orders/*/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/orders/place").hasAnyRole("USER", "CUSTOMER")
                .requestMatchers("/orders/cart", "/orders/cart/**").hasAnyRole("USER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/orders/my").hasAnyRole("USER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/orders/*").hasAnyRole("USER", "CUSTOMER", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
