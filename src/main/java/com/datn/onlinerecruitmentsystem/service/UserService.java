package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.dto.request.ChangePasswordRequest;
import com.datn.onlinerecruitmentsystem.dto.request.CreateUserRequest;
import com.datn.onlinerecruitmentsystem.dto.request.UpdateProfileRequest;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.enums.Role;
import com.datn.onlinerecruitmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findOrCreateUserByGoogleId(String email, String name, String googleId) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
                user.setGoogleId(googleId);
                userRepository.save(user);
            }
            return user;
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(name);
        newUser.setGoogleId(googleId);

        newUser.setPasswordHash(passwordEncoder.encode("social_login_placeholder_password"));

        newUser.setRole(Role.CANDIDATE);

        return userRepository.save(newUser);
    }

    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setAge(request.getAge());
        return userRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng!");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new com.datn.onlinerecruitmentsystem.exception.DuplicateResourceException("Email đã tồn tại!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userRepository.save(user);
    }
}