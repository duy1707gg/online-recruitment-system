package com.datn.onlinerecruitmentsystem.repository;

import com.datn.onlinerecruitmentsystem.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByInterviewerId(Long interviewerId);

    Optional<Interview> findByRoomId(String roomId);

    boolean existsByApplicationIdAndScheduledTime(Long applicationId, java.time.LocalDateTime scheduledTime);
}