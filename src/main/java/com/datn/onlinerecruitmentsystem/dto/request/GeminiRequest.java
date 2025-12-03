package com.datn.onlinerecruitmentsystem.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiRequest {
    private List<Content> contents;

    @JsonProperty("generation_config")
    private GenerationConfig generationConfig;

    public static GeminiRequest create(String prompt, String systemInstruction) {

        Part systemPart = new Part(systemInstruction);
        Content systemContent = new Content(List.of(systemPart), "user");

        Part userPart = new Part(prompt);
        Content userContent = new Content(List.of(userPart), "user");

        return new GeminiRequest(List.of(systemContent, userContent), null);
    }
}