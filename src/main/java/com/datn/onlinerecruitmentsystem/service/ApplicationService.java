package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.entity.Application;
import com.datn.onlinerecruitmentsystem.entity.Job;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.enums.ApplicationStatus;
import com.datn.onlinerecruitmentsystem.enums.JobStatus;
import com.datn.onlinerecruitmentsystem.repository.ApplicationRepository;
import com.datn.onlinerecruitmentsystem.repository.JobRepository;
import com.datn.onlinerecruitmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Application applyJob(String email, Long jobId, MultipartFile cvFile) throws IOException {
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException("Tin tuyển dụng này đã đóng hoặc chưa công khai!");
        }

        if (applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), job.getId())) {
            throw new RuntimeException("Bạn đã ứng tuyển công việc này rồi!");
        }

        String fileName = UUID.randomUUID().toString() + "_" + cvFile.getOriginalFilename();
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(cvFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        String cvUrl = "/uploads/" + fileName;

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        application.setCvUrl(cvUrl);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setAppliedAt(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    public void updateCv(Long applicationId, MultipartFile file) throws IOException {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        application.setCvUrl("/uploads/" + fileName);
        applicationRepository.save(application);
    }

    public void deleteApplicationByRecruiter(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đơn ứng tuyển với ID: " + id);
        }
        applicationRepository.deleteById(id);
    }

    public void deleteMyApplication(Long applicationId, String email) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển"));

        if (!app.getCandidate().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền xóa đơn ứng tuyển này!");
        }

        if (app.getStatus() == ApplicationStatus.OFFERED || app.getStatus() == ApplicationStatus.REJECTED) {
            throw new RuntimeException("Không thể rút hồ sơ đã có kết quả phỏng vấn.");
        }

        applicationRepository.deleteById(applicationId);
    }

    public List<Application> getApplicationsByJobId(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> getMyApplications(String email) {
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByCandidateId(candidate.getId());
    }

    public Application updateApplicationStatus(Long applicationId, String statusStr) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        try {
            ApplicationStatus newStatus = ApplicationStatus.valueOf(statusStr);
            app.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }

        return applicationRepository.save(app);
    }
}