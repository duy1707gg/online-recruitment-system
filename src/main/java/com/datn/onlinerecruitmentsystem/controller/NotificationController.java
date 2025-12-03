package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.entity.Notification;
import com.datn.onlinerecruitmentsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n != null) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    @PutMapping("/read-all/{userId}")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @DeleteMapping("/delete-all/{userId}")
    public ResponseEntity<?> deleteAllNotifications(@PathVariable Long userId) {
        notificationRepository.deleteAllByUserId(userId);
        return ResponseEntity.ok().build();
    }
}