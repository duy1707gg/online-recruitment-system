package com.datn.onlinerecruitmentsystem.dto;

import lombok.Data;

@Data
public class TestCaseDTO {
    private Long id;
    private String input;
    private String output;
    private boolean isHidden;
}