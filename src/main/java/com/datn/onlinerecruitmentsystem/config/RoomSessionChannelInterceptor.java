package com.datn.onlinerecruitmentsystem.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.stereotype.Component;
import org.springframework.messaging.support.ChannelInterceptor;

@Component
public class RoomSessionChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(message);

        StompCommand command = (StompCommand) accessor.getHeader("stompCommand");

        if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();

            if (destination != null && destination.startsWith("/topic/interview/")) {
                String[] segments = destination.split("/");
                String roomId = segments[segments.length - 1];

                if (accessor.getSessionAttributes() != null) {
                    accessor.getSessionAttributes().put("room_id", roomId);
                    System.out.println("Session attribute 'room_id' set to: " + roomId);
                }
            }
        }
        return message;
    }
}