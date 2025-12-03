package com.datn.onlinerecruitmentsystem.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
    private Integer age;
}