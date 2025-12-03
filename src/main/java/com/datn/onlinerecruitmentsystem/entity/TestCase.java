package com.datn.onlinerecruitmentsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "test_cases")
@Data
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String inputData;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    private boolean isHidden;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;
}