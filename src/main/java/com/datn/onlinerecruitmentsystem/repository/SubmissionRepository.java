package com.datn.onlinerecruitmentsystem.repository;

import com.datn.onlinerecruitmentsystem.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByUserIdAndProblemId(Long userId, Long problemId);

    List<Submission> findByUserId(Long userId);
}