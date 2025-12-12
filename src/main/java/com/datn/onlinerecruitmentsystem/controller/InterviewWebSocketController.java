package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.dto.SignalMessage;
import com.datn.onlinerecruitmentsystem.service.InterviewWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class InterviewWebSocketController {

    private final InterviewWebSocketService interviewWebSocketService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/interview/{roomId}")
    public void handleSignal(@DestinationVariable String roomId, @Payload SignalMessage message) {

        if (message.getType().equals("JOIN")) {
            SignalMessage errorMessage = interviewWebSocketService.handleJoin(roomId, message.getSender());

            if (errorMessage == null) {
                // Join successful, broadcast to room
                messagingTemplate.convertAndSend("/topic/interview/" + roomId, message);
            }
            // If error, the service already logs it. We could optionally broadcast the
            // error.

        } else if (message.getType().equals("LEAVE")) {
            interviewWebSocketService.handleLeave(roomId);
            messagingTemplate.convertAndSend("/topic/interview/" + roomId, message);
        } else {
            messagingTemplate.convertAndSend("/topic/interview/" + roomId, message);
        }
    }
}
