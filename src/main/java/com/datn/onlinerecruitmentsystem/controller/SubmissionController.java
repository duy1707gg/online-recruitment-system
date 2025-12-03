package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.dto.SubmissionDTO;
import com.datn.onlinerecruitmentsystem.entity.Submission;
import com.datn.onlinerecruitmentsystem.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<?> submitCode(@RequestBody SubmissionDTO dto) {
        try {
            Submission result = submissionService.submitCode(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}