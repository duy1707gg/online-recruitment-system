package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.entity.Application;
import com.datn.onlinerecruitmentsystem.entity.Job;
import com.datn.onlinerecruitmentsystem.service.ApplicationService;
import com.datn.onlinerecruitmentsystem.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recruitment")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RecruitmentController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllOpenJobs() {
        return ResponseEntity.ok(jobService.getAllOpenJobs());
    }

    @GetMapping("/jobs/all")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<List<Job>> getAllJobsForManager() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Job> createJob(@RequestBody Job job, @RequestParam Long recruiterId) {
        return ResponseEntity.ok(jobService.createJob(job, recruiterId));
    }

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> applyJob(
            @RequestParam("jobId") Long jobId,
            @RequestParam("cvFile") MultipartFile cvFile) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();

            Application application = applicationService.applyJob(email, jobId, cvFile);
            return ResponseEntity.ok(application);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi lưu file: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(jobId));
    }

    @GetMapping("/applications/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<Application>> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(applicationService.getMyApplications(email));
    }

    @DeleteMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<String> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplicationByRecruiter(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @DeleteMapping("/applications/{id}/cancel")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> cancelApplication(@PathVariable Long id) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            applicationService.deleteMyApplication(id, currentUserEmail);
            return ResponseEntity.ok("Đã rút hồ sơ thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping(value = "/applications/{id}/update-cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> updateCv(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            applicationService.updateCv(id, file);
            return ResponseEntity.ok("Cập nhật CV thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi cập nhật CV: " + e.getMessage());
        }
    }

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Application> updateApplicationStatus(@PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }

    @PutMapping("/jobs/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, jobDetails));
    }

    @DeleteMapping("/jobs/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}