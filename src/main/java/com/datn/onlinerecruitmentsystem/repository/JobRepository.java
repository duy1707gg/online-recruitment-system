package com.datn.onlinerecruitmentsystem.repository;

import com.datn.onlinerecruitmentsystem.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(com.datn.onlinerecruitmentsystem.enums.JobStatus status);

    List<Job> findByRecruiterId(Long recruiterId);
}