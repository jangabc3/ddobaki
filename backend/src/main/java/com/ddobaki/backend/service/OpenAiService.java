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
                                아래 문서 내용을 분석해서, 반드시 아래 JSON 형식으로만, 이 순서대로 응답하세요.

                {
                "summary": "이 문서가 '무엇에 관한 문서인지'만 한 문장으로 설명하세요. 예: '재산세 납부를 안내하는 고지서입니다.' 금액이나 날짜는 여기 넣지 마세요, actionText에 따로 넣을 거예요.",
                "actionText": "사용자가 지금 해야 할 행동을 반드시 채우세요. 날짜나 기한은 절대 포함하지 마세요(화면에 따로 하이라이트로 표시되기 때문에 여기 넣으면 중복됩니다). 금액이 있으면 '129,390원을 계좌에 준비하세요.'처럼, 서류가 필요하면 '서류를 제출하세요.'처럼 행동만 간결하게 쓰세요. 정말로 아무 조치도 필요 없는 문서(단순 안내, 결과 통보 등)일 때는 빈 문자열('')로 남겨두세요. 절대 오타를 내거나 애매한 문장을 만들지 마세요.",
                "dueDate": "기한이 있다면 사람이 읽기 쉬운 날짜(예: 8월 31일까지), 없으면 빈 문자열",
                "dueDateIso": "기한이 있다면 YYYY-MM-DD 형식, 없으면 빈 문자열",
                "evidenceSentences": "actionText나 summary에 이미 나온 금액/날짜를 그대로 반복하지 마세요. 대신 '왜' 이런 금액이나 조치가 발생했는지 설명하는 원문 문장을 최대 3개까지 그대로 옮기세요. 예를 들어 '소득·재산 자료가 연계되어 보험료가 조정되었습니다'처럼 이유나 근거, 조항에 해당하는 문장을 우선하세요. 그런 문장이 문서에 없으면 배열을 비워도 됩니다."
                }

                                반드시 문서에 실제로 있는 내용만 사용하고, 없는 내용은 추측하지 마세요.
                                """;

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-5.6-terra",
                "max_completion_tokens", 1024,
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