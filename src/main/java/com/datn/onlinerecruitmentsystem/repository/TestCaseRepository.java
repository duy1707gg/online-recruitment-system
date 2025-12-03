package com.datn.onlinerecruitmentsystem.repository;

import com.datn.onlinerecruitmentsystem.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblemId(Long problemId);
    void deleteAllByProblemId(Long problemId);
}