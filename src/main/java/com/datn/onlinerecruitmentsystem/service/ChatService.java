package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.dto.request.GeminiRequest;
import com.datn.onlinerecruitmentsystem.dto.response.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;
import javax.annotation.PostConstruct;
import reactor.netty.http.client.HttpClient;
import io.netty.channel.ChannelOption;
import java.time.Duration;

@Service
public class ChatService {

    @Value("${ai.api.key}")
    private String apiKey;

    private WebClient webClient;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    private final String SYSTEM_INSTRUCTION = "Bạn là trợ lý AI tuyển dụng chuyên nghiệp cho Hệ thống Tuyển dụng Trực tuyến. Bạn phải trả lời các câu hỏi về việc làm, CV, mẹo phỏng vấn, và kỹ năng chuyên môn. Hãy trả lời ngắn gọn, thân thiện và bằng tiếng Việt.";

    @PostConstruct
    public void init() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)

                .responseTimeout(Duration.ofSeconds(30));

        this.webClient = WebClient.builder()
                .baseUrl(GEMINI_API_URL)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }


    public String getChatResponse(String prompt) {

        GeminiRequest requestBody = GeminiRequest.create(prompt, SYSTEM_INSTRUCTION);

        try {
            Mono<GeminiResponse> responseMono = webClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse -> {
                        return clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                            System.err.println("Gemini API Error Response: " + errorBody);
                            return Mono.error(new RuntimeException("Lỗi từ Gemini API: " + clientResponse.statusCode()));
                        });
                    })
                    .bodyToMono(GeminiResponse.class);

            GeminiResponse response = responseMono.block();

            if (response != null) {
                return response.getResponseText();
            }

        } catch (Exception e) {
            System.err.println("Lỗi gọi API Gemini: " + e.getMessage());
            return "Xin lỗi, hệ thống AI đang gặp lỗi kết nối hoặc xử lý. Vui lòng thử lại sau.";
        }

        return "Đã xảy ra lỗi không xác định.";
    }
}