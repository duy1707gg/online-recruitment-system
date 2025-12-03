package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.entity.Job;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.enums.JobStatus;
import com.datn.onlinerecruitmentsystem.repository.JobRepository;
import com.datn.onlinerecruitmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    public Job createJob(Job job, Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        job.setRecruiter(recruiter);
        job.setStatus(JobStatus.OPEN);
        return jobRepository.save(job);
    }
    public Job updateJob(Long id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setLocation(jobDetails.getLocation());
        if (jobDetails.getStatus() != null) {
            job.setStatus(jobDetails.getStatus());
        }

        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found");
        }
        jobRepository.deleteById(id);
    }
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
}