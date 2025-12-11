package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.entity.Application;
import com.datn.onlinerecruitmentsystem.entity.Interview;
import com.datn.onlinerecruitmentsystem.entity.Notification;
import com.datn.onlinerecruitmentsystem.entity.User;
import com.datn.onlinerecruitmentsystem.repository.ApplicationRepository;
import com.datn.onlinerecruitmentsystem.repository.InterviewRepository;
import com.datn.onlinerecruitmentsystem.repository.NotificationRepository;
import com.datn.onlinerecruitmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewService {
        @Value("${app.frontend.url:http://localhost:5173}")
        private String frontendUrl;

        private final InterviewRepository interviewRepository;
        private final ApplicationRepository applicationRepository;
        private final UserRepository userRepository;
        private final EmailService emailService;
        private final InterviewRoomTracker interviewRoomTracker;

        @Autowired
        private SimpMessagingTemplate messagingTemplate;
        @Autowired
        private NotificationRepository notificationRepository;

        @Transactional
        public Interview scheduleInterview(Long applicationId, Long interviewerId, String timeStr,
                        String schedulerEmail) {
                Application app = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));
                User interviewer = userRepository.findById(interviewerId)
                                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

                LocalDateTime scheduledTime = LocalDateTime.parse(timeStr);

                // Check for duplicates
                if (interviewRepository.existsByApplicationIdAndScheduledTime(applicationId, scheduledTime)) {
                        throw new RuntimeException("Interview already scheduled for this application at this time.");
                }

                Interview interview = new Interview();
                interview.setApplication(app);
                interview.setInterviewer(interviewer);
                interview.setScheduledTime(scheduledTime);

                if (schedulerEmail != null) {
                        userRepository.findByEmail(schedulerEmail).ifPresent(interview::setScheduler);
                }

                interview.setRoomId(UUID.randomUUID().toString());

                interview.setMeetingLink(frontendUrl + "/room/interview-" + interview.getRoomId());

                interview.setResult("PENDING");

                // Update application status
                app.setStatus(com.datn.onlinerecruitmentsystem.enums.ApplicationStatus.INTERVIEWING);
                applicationRepository.save(app);

                // Save Interview FIRST to ensure DB integrity before sending external
                // notifications
                Interview savedInterview = interviewRepository.save(interview);

                // Add to tracker
                interviewRoomTracker.addAllowedParticipants(savedInterview.getRoomId(),
                                app.getCandidate() != null ? app.getCandidate().getId() : null,
                                interviewer.getId());

                // Notify Interviewer
                Notification notif = new Notification();
                notif.setUserId(interviewerId);
                notif.setContent("Bạn có lịch phỏng vấn mới lúc " + timeStr);
                notif.setRead(false);
                notificationRepository.save(notif);

                messagingTemplate.convertAndSend("/topic/notifications/" + interviewerId, notif);

                // Notify Candidate
                User candidate = app.getCandidate();
                if (candidate != null) {
                        Notification candidateNotif = new Notification();
                        candidateNotif.setUserId(candidate.getId());
                        candidateNotif
                                        .setContent("Bạn có lịch phỏng vấn mới cho vị trí " + app.getJob().getTitle()
                                                        + " lúc " + timeStr);
                        candidateNotif.setRead(false);
                        notificationRepository.save(candidateNotif);

                        messagingTemplate.convertAndSend("/topic/notifications/" + candidate.getId(), candidateNotif);
                }

                // Notify Scheduler (if different from interviewer)
                if (schedulerEmail != null) {
                        userRepository.findByEmail(schedulerEmail).ifPresent(scheduler -> {
                                if (!scheduler.getId().equals(interviewerId)) {
                                        Notification schedulerNotif = new Notification();
                                        schedulerNotif.setUserId(scheduler.getId());
                                        schedulerNotif.setContent("Bạn đã lên lịch phỏng vấn thành công cho ứng viên "
                                                        + (candidate != null ? candidate.getFullName() : "") + " lúc "
                                                        + timeStr);
                                        schedulerNotif.setRead(false);
                                        notificationRepository.save(schedulerNotif);

                                        messagingTemplate.convertAndSend("/topic/notifications/" + scheduler.getId(),
                                                        schedulerNotif);

                                        // Send Email to Scheduler
                                        emailService.sendSimpleMessage(
                                                        scheduler.getEmail(),
                                                        "Lên lịch phỏng vấn thành công",
                                                        "Bạn đã lên lịch phỏng vấn cho ứng viên "
                                                                        + (candidate != null ? candidate.getFullName()
                                                                                        : "")
                                                                        +
                                                                        " vào lúc " + timeStr + ".\nLink phòng họp: "
                                                                        + interview.getMeetingLink());
                                }
                        });
                }

                // Send Email to Interviewer
                emailService.sendSimpleMessage(
                                interviewer.getEmail(),
                                "Lịch phỏng vấn mới",
                                "Bạn có lịch phỏng vấn mới vào lúc " + timeStr + ".\nLink phòng họp: "
                                                + interview.getMeetingLink());

                // Send Email to Candidate
                if (candidate != null) {
                        emailService.sendSimpleMessage(
                                        candidate.getEmail(),
                                        "Mời phỏng vấn - " + app.getJob().getTitle(),
                                        "Bạn có lịch phỏng vấn cho vị trí " + app.getJob().getTitle() +
                                                        " vào lúc " + timeStr + ".\nLink phòng họp: "
                                                        + interview.getMeetingLink());
                }

                return savedInterview;
        }

        public Interview getInterviewByRoomId(String roomId) {
                return interviewRepository.findByRoomId(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found"));
        }

}