package com.goldenagro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth

                                                // Public endpoints
                                                .requestMatchers("/api/public/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/retailers").permitAll()
                                                .requestMatchers("/api/activity-logs/**")
                                                .hasAnyRole("ADMIN", "MANUFACTURER")

                                                // Admin only
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Admin and Manufacturer
                                                .requestMatchers("/api/production/**")
                                                .hasAnyRole("ADMIN", "MANUFACTURER")
                                                .requestMatchers("/api/raw-materials/**")
                                                .hasAnyRole("ADMIN", "MANUFACTURER")
                                                .requestMatchers("/api/bom/**").hasAnyRole("ADMIN", "MANUFACTURER")
                                                .requestMatchers("/api/suppliers/**")
                                                .hasAnyRole("ADMIN", "MANUFACTURER")
                                                .requestMatchers("/api/customers/**")
                                                .hasAnyRole("ADMIN", "MANUFACTURER")

                                                // Other existing endpoints
                                                .requestMatchers("/api/purchases/**")
                                                .hasAnyRole("ADMIN", "MANUFACTURER")

                                                // All other authenticated users
                                                .anyRequest().authenticated())

                                .addFilterBefore(
                                                jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
