package com.datn.onlinerecruitmentsystem.dto;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;
    private String sender;
    private Object data;
}