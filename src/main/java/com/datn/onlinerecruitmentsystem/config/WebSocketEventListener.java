package com.datn.onlinerecruitmentsystem.config;

import com.datn.onlinerecruitmentsystem.service.InterviewRoomTracker;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;


@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final InterviewRoomTracker roomTracker;


    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {

    }


    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        if (sessionAttributes != null) {
            String roomId = (String) sessionAttributes.get("room_id");

            if (roomId != null) {
                roomTracker.userLeft(roomId);
                System.out.println("User disconnected and removed from room: " + roomId);

            }
        }
    }
}