package com.datn.onlinerecruitmentsystem.entity;

import com.datn.onlinerecruitmentsystem.enums.Role;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;
    private String fullName;
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "age")
    private Integer age;

    private String googleId;

    private LocalDateTime createdAt = LocalDateTime.now();
}