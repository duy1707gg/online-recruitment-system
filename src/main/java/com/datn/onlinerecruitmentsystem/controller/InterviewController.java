package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.entity.Interview;
import com.datn.onlinerecruitmentsystem.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@CrossOrigin("*")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Interview> scheduleInterview(@RequestParam Long applicationId,
            @RequestParam Long interviewerId,
            @RequestParam String time,
            Authentication authentication) {
        String schedulerEmail = authentication.getName();
        return ResponseEntity
                .ok(interviewService.scheduleInterview(applicationId, interviewerId, time, schedulerEmail));
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Interview> getInterviewByRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(interviewService.getInterviewByRoomId(roomId));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Interview> submitFeedback(@PathVariable Long id,
            @RequestBody String feedback,
            @RequestParam String result) {
        return ResponseEntity.ok(interviewService.submitFeedback(id, feedback, result));
    }
}