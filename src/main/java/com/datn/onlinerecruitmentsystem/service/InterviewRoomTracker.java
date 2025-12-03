package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.entity.Interview;
import com.datn.onlinerecruitmentsystem.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class InterviewRoomTracker {

    private final InterviewRepository interviewRepository;

    private final Map<String, Integer> activeUsersInRoom = new ConcurrentHashMap<>();
    private final Map<String, Set<Long>> allowedParticipants = new ConcurrentHashMap<>();
    private static final int MAX_PARTICIPANTS = 2;

    public boolean canJoin(String roomId, Long userId) {
        // 1. Validate participant
        if (!isAllowed(roomId, userId)) {
            return false;
        }
        // 2. Check capacity
        int currentCount = activeUsersInRoom.getOrDefault(roomId, 0);
        return currentCount < MAX_PARTICIPANTS;
    }

    // Overload for backward compatibility if needed, but we should migrate usages
    public boolean canJoin(String roomId) {
        // This method is deprecated or should only be used if we don't care about user
        // validation (which we do now)
        // For now, let's keep it but it's unsafe.
        // Better to force using the one with userId.
        // But existing code uses it. I will update existing code.
        int currentCount = activeUsersInRoom.getOrDefault(roomId, 0);
        return currentCount < MAX_PARTICIPANTS;
    }

    public void userJoined(String roomId) {
        activeUsersInRoom.merge(roomId, 1, Integer::sum);
    }

    public void userLeft(String roomId) {
        activeUsersInRoom.computeIfPresent(roomId, (k, v) -> v > 1 ? v - 1 : null);
    }

    public int getParticipantCount(String roomId) {
        return activeUsersInRoom.getOrDefault(roomId, 0);
    }

    public void addAllowedParticipants(String roomId, Long candidateId, Long interviewerId) {
        Set<Long> participants = new HashSet<>();
        if (candidateId != null)
            participants.add(candidateId);
        if (interviewerId != null)
            participants.add(interviewerId);
        allowedParticipants.put(roomId, participants);
    }

    private boolean isAllowed(String roomId, Long userId) {
        if (allowedParticipants.containsKey(roomId)) {
            return allowedParticipants.get(roomId).contains(userId);
        }

        // Lazy load from DB
        Optional<Interview> interviewOpt = interviewRepository.findByRoomId(roomId);
        if (interviewOpt.isPresent()) {
            Interview interview = interviewOpt.get();
            Long candidateId = interview.getApplication().getCandidate() != null
                    ? interview.getApplication().getCandidate().getId()
                    : null;
            Long interviewerId = interview.getInterviewer() != null ? interview.getInterviewer().getId() : null;

            addAllowedParticipants(roomId, candidateId, interviewerId);

            return allowedParticipants.get(roomId).contains(userId);
        }

        return false;
    }
}