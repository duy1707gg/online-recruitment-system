package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.dto.request.ChangePasswordRequest;
import com.datn.onlinerecruitmentsystem.dto.request.UpdateProfileRequest;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("")
    public ResponseEntity<List<User>> getUserAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/recruiters")
    public ResponseEntity<List<User>> getRecruiters() {
        return ResponseEntity.ok(userService.getAllRecruiters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            String fileUrl = userService.uploadAvatar(email, file);
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi tải ảnh: " + e.getMessage());
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User updatedUser = userService.updateProfile(email, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            userService.changePassword(email, request);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}