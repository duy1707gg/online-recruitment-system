package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.dto.request.CreateJobRequest;
import com.datn.onlinerecruitmentsystem.dto.response.PageResponse;
import com.datn.onlinerecruitmentsystem.entity.Job;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.enums.JobStatus;
import com.datn.onlinerecruitmentsystem.exception.ResourceNotFoundException;
import com.datn.onlinerecruitmentsystem.repository.JobRepository;
import com.datn.onlinerecruitmentsystem.repository.JobSpecification;
import com.datn.onlinerecruitmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus(JobStatus.OPEN);
    }

    /**
     * Search jobs with filters and pagination
     */
    public PageResponse<Job> searchJobs(String keyword, String location, String category, Pageable pageable) {
        Page<Job> page = jobRepository.findAll(
                JobSpecification.searchJobs(keyword, location, category),
                pageable);

        return PageResponse.<Job>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    /**
     * Get all open jobs with pagination
     */
    public PageResponse<Job> getOpenJobsPaginated(Pageable pageable) {
        Page<Job> page = jobRepository.findAll(
                JobSpecification.searchJobs(null, null, null),
                pageable);

        return PageResponse.<Job>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    public Job createJob(Job job, Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));
        job.setRecruiter(recruiter);
        job.setStatus(JobStatus.OPEN);
        return jobRepository.save(job);
    }

    public Job createJobFromRequest(CreateJobRequest request, Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setCategory(request.getCategory());
        job.setRecruiter(recruiter);
        job.setStatus(JobStatus.OPEN);

        return jobRepository.save(job);
    }

    public Job updateJob(Long id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setLocation(jobDetails.getLocation());
        if (jobDetails.getCategory() != null) {
            job.setCategory(jobDetails.getCategory());
        }
        if (jobDetails.getStatus() != null) {
            job.setStatus(jobDetails.getStatus());
        }

        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job", "id", id);
        }
        jobRepository.deleteById(id);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
    }
}