package com.datn.onlinerecruitmentsystem.controller;

import com.datn.onlinerecruitmentsystem.service.ChatService;
import com.datn.onlinerecruitmentsystem.dto.request.ChatRequest; // Import DTO vừa tạo
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;


    @PostMapping("/ask")
    public ResponseEntity<String> askChatbot(@RequestBody ChatRequest request) {
        if (request == null || request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập câu hỏi.");
        }

        String response = chatService.getChatResponse(request.getPrompt());

        return ResponseEntity.ok(response);
    }
}