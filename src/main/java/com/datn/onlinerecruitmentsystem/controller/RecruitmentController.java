package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.dto.request.CreateJobRequest;
import com.datn.onlinerecruitmentsystem.dto.response.PageResponse;
import com.datn.onlinerecruitmentsystem.entity.Application;
import com.datn.onlinerecruitmentsystem.entity.Job;
import com.datn.onlinerecruitmentsystem.service.ApplicationService;
import com.datn.onlinerecruitmentsystem.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
@Tag(name = "Recruitment", description = "API quản lý tuyển dụng và ứng tuyển")
public class RecruitmentController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @GetMapping("/jobs")
    @Operation(summary = "Lấy danh sách việc làm đang tuyển", description = "Trả về danh sách tất cả việc làm có trạng thái OPEN")
    public ResponseEntity<List<Job>> getAllOpenJobs() {
        return ResponseEntity.ok(jobService.getAllOpenJobs());
    }

    @GetMapping("/jobs/search")
    @Operation(summary = "Tìm kiếm việc làm", description = "Tìm kiếm và lọc việc làm với phân trang")
    @ApiResponse(responseCode = "200", description = "Danh sách việc làm phù hợp")
    public ResponseEntity<PageResponse<Job>> searchJobs(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String keyword,
            @Parameter(description = "Địa điểm") @RequestParam(required = false) String location,
            @Parameter(description = "Ngành nghề") @RequestParam(required = false) String category,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số items mỗi trang") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(jobService.searchJobs(keyword, location, category, pageable));
    }

    @GetMapping("/jobs/paginated")
    @Operation(summary = "Lấy danh sách việc làm có phân trang")
    public ResponseEntity<PageResponse<Job>> getJobsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(jobService.getOpenJobsPaginated(pageable));
    }

    @GetMapping("/jobs/all")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Lấy tất cả việc làm (Admin/Recruiter)")
    public ResponseEntity<List<Job>> getAllJobsForManager() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/jobs/{id}")
    @Operation(summary = "Lấy chi tiết một việc làm")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Tạo tin tuyển dụng mới")
    public ResponseEntity<Job> createJob(@RequestBody Job job, @RequestParam Long recruiterId) {
        return ResponseEntity.ok(jobService.createJob(job, recruiterId));
    }

    @PostMapping("/jobs/create")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Tạo tin tuyển dụng mới (với validation)")
    public ResponseEntity<Job> createJobValidated(
            @Valid @RequestBody CreateJobRequest request,
            @RequestParam Long recruiterId) {
        return ResponseEntity.ok(jobService.createJobFromRequest(request, recruiterId));
    }

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Ứng tuyển công việc", description = "Upload CV và ứng tuyển")
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
    @Operation(summary = "Lấy danh sách ứng viên theo công việc")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(jobId));
    }

    @GetMapping("/applications/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Lấy danh sách đơn ứng tuyển của tôi")
    public ResponseEntity<List<Application>> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(applicationService.getMyApplications(email));
    }

    @DeleteMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Xóa đơn ứng tuyển (Admin/Recruiter)")
    public ResponseEntity<String> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplicationByRecruiter(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @DeleteMapping("/applications/{id}/cancel")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Rút hồ sơ ứng tuyển")
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
    @Operation(summary = "Cập nhật CV")
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
    @Operation(summary = "Cập nhật trạng thái đơn ứng tuyển")
    public ResponseEntity<Application> updateApplicationStatus(@PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }

    @PutMapping("/jobs/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Cập nhật tin tuyển dụng")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, jobDetails));
    }

    @DeleteMapping("/jobs/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Xóa tin tuyển dụng")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}