package com.datn.onlinerecruitmentsystem.entity;

import com.datn.onlinerecruitmentsystem.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "applications")
@Data
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private User candidate;

    private String cvUrl;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private LocalDateTime appliedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "application")
    @JsonIgnore
    private List<Interview> interviews = new ArrayList<>();

    @JsonProperty("interview")
    @JsonIgnoreProperties("application")
    public Interview getInterview() {
        if (interviews != null && !interviews.isEmpty()) {
            return interviews.get(interviews.size() - 1);
        }
        return null;
    }
}