package com.datn.onlinerecruitmentsystem.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProblemDTO {
    private String title;
    private String slug;
    private String description;
    private String difficulty;
    private Double cpuTimeLimit;
    private Integer memoryLimitMb;
    private String templateCode;

    private List<TestCaseDTO> testCases;
}