package com.datn.onlinerecruitmentsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    private String language;
    private String status;

    private Integer passCount;
    private Integer totalTestCases;
    private Integer runtimeMs;
    private Double memoryUsageKb;

    private LocalDateTime createdAt = LocalDateTime.now();
}