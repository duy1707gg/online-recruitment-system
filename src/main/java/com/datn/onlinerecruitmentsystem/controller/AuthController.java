package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.dto.response.AuthResponse;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.repository.UserRepository;
import com.datn.onlinerecruitmentsystem.utils.JwtUtils;
import com.datn.onlinerecruitmentsystem.dto.request.GoogleLoginRequest;
import com.datn.onlinerecruitmentsystem.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        userRepository.save(user);
        return "User added to system";
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> getToken(@RequestBody User authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPasswordHash()));

        if (authentication.isAuthenticated()) {
            String token = jwtUtils.generateToken(authRequest.getEmail());
            User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow();
            return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getId()));
        } else {
            throw new RuntimeException("Invalid user request !");
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdToken.Payload payload = verifyGoogleIdToken(request.getIdToken());

            if (payload == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google ID Token");
            }

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleId = payload.getSubject();

            User user = userService.findOrCreateUserByGoogleId(email, name, googleId);

            String appToken = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(appToken, user.getRole().name(), user.getId()));

        } catch (GeneralSecurityException | IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed due to server error");
        }
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken googleIdToken = verifier.verify(idToken);

        if (googleIdToken != null) {
            return googleIdToken.getPayload();
        } else {
            return null;
        }
    }
}