package com.example.Assets.service;

import com.example.Assets.auth.AuthorIdGenerator;
import com.example.Assets.auth.CustomUserDetails;
import com.example.Assets.auth.JwtService;
import com.example.Assets.auth.dto.AuthResponse;
import com.example.Assets.auth.dto.LoginRequest;
import com.example.Assets.auth.dto.RegisterRequest;
import com.example.Assets.auth.dto.UserProfileResponse;
import com.example.Assets.model.User;
import com.example.Assets.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String authorId = AuthorIdGenerator.generate(request.getDisplayName(), email);
        User user = new User(email, passwordEncoder.encode(request.getPassword()), request.getDisplayName());
        user.setAuthorId(authorId);
        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    }

    public UserProfileResponse profile(CustomUserDetails user) {
        return new UserProfileResponse(user.getUsername(), user.getDisplayName(), user.getAuthorId());
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token,
                jwtService.getExpirationMs(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAuthorId());
    }
}
