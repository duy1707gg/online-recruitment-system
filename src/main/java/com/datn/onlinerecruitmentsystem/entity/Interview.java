package com.datn.onlinerecruitmentsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    @ManyToOne
    @JoinColumn(name = "interviewer_id")
    private User interviewer;

    private LocalDateTime scheduledTime;
    private String roomId;
    private String meetingLink;

    @Column(columnDefinition = "TEXT")
    private String feedback;
    private String result;

    private LocalDateTime createdAt = LocalDateTime.now();
}