package com.datn.onlinerecruitmentsystem.repository;

import com.datn.onlinerecruitmentsystem.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);

    List<Application> findByJobId(Long jobId);

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(applied_at) as date, COUNT(*) as count FROM applications GROUP BY DATE(applied_at)", nativeQuery = true)
    List<Object[]> countApplicationsByDate();

    @org.springframework.data.jpa.repository.Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countApplicationsByStatus();
}