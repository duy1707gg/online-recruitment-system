package com.datn.onlinerecruitmentsystem.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String prompt;
}