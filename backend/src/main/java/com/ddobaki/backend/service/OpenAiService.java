package com.ddobaki.backend.service;

import com.ddobaki.backend.dto.ExplainResponse;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    private final RestClient restClient = RestClient.create();
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Value("${openai.api.key}")
    private String apiKey;

    public ExplainResponse explain(String maskedText) {
        String systemPrompt = """
                당신은 어려운 한국 행정/금융 문서를 쉽게 설명해주는 도우미입니다.
                아래 문서 내용을 분석해서, 반드시 아래 JSON 형식으로만 응답하세요.

                {
                  "summary": "문서를 한 문장으로 쉽게 설명",
                  "dueDate": "기한이 있다면 날짜, 없으면 빈 문자열",
                  "amount": "금액이 있다면 금액, 없으면 빈 문자열",
                  "evidenceSentences": ["설명의 근거가 된 원문 문장들"]
                }

                반드시 문서에 실제로 있는 내용만 사용하고, 없는 내용은 추측하지 마세요.
                """;

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-5.6-terra",
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", maskedText)));

        Map<?, ?> response = restClient.post()
                .uri("https://api.openai.com/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        List<?> choices = (List<?>) response.get("choices");
        Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
        Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
        String text = (String) message.get("content");

        try {
            return jsonMapper.readValue(text, ExplainResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 응답을 해석하는 데 실패했어요: " + text, e);
        }
    }
}