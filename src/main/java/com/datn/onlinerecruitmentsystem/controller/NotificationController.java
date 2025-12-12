package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.entity.Notification;
import com.datn.onlinerecruitmentsystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all/{userId}")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }

    @DeleteMapping("/delete-all/{userId}")
    public ResponseEntity<?> deleteAllNotifications(@PathVariable Long userId) {
        notificationService.deleteAllByUserId(userId);
        return ResponseEntity.ok().build();
    }
}
