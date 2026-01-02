package com.datn.onlinerecruitmentsystem.repository;

import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
        Optional<User> findByEmail(String email);

        Optional<User> findByGoogleId(String googleId);
        List<User> findByRole(Role role);
}