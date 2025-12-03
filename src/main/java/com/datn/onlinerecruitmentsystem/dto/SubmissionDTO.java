package com.datn.onlinerecruitmentsystem.dto;

import lombok.Data;

@Data
public class SubmissionDTO {
    private Long userId;
    private Long problemId;
    private String sourceCode;
    private String language;
}