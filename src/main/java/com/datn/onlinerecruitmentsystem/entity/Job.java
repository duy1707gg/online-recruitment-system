package com.datn.onlinerecruitmentsystem.entity;

import com.datn.onlinerecruitmentsystem.enums.JobStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String salaryRange;
    private String location;
    private String category; // IT, Marketing, HR, Finance, etc.

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN;

    @ManyToOne
    @JoinColumn(name = "recruiter_id")
    private User recruiter;

    private LocalDateTime createdAt = LocalDateTime.now();
}