package com.goldenagro.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.issuer}")
    private String jwtIssuer;

    @Value("${jwt.audience}")
    private String jwtAudience;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(jwtIssuer)
                    .requireAudience(jwtAudience)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.get("user_id", String.class);
            String email = claims.getSubject();
            String role = claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", String.class);
            
            // Fallback for role claim
            if (role == null) {
                role = claims.get("role", String.class);
            }
            if (role == null || role.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            // retailer_id may be stored as string (e.g. from .NET AuthService) or number
            Integer retailerId = null;
            Object retailerIdObj = claims.get("retailer_id");
            if (retailerIdObj != null) {
                if (retailerIdObj instanceof Number) {
                    retailerId = ((Number) retailerIdObj).intValue();
                } else if (retailerIdObj instanceof String) {
                    try {
                        retailerId = Integer.parseInt((String) retailerIdObj);
                    } catch (NumberFormatException ignored) { }
                }
            }

            // Create custom principal with user details
            UserPrincipal principal = new UserPrincipal(userId, email, role, retailerId);

            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}