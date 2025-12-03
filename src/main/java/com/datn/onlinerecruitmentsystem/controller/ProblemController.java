package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.dto.ProblemDTO;
import com.datn.onlinerecruitmentsystem.entity.Problem;
import com.datn.onlinerecruitmentsystem.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/problems")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Problem> getProblemBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(problemService.getProblemBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Problem> createProblem(@RequestBody ProblemDTO problemDTO) {
        return ResponseEntity.ok(problemService.createProblem(problemDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Problem> updateProblem(@PathVariable Long id, @RequestBody ProblemDTO problemDTO) {
        Problem updatedProblem = problemService.updateProblem(id, problemDTO);
        return ResponseEntity.ok(updatedProblem);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<?> deleteProblem(@PathVariable Long id) {
        return ResponseEntity.ok("Deleted problem successfully");
    }
}