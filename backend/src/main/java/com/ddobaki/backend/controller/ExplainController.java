package com.ddobaki.backend.controller;

import com.ddobaki.backend.dto.ExplainRequest;
import com.ddobaki.backend.dto.ExplainResponse;
import com.ddobaki.backend.service.OpenAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ExplainController {

    private final OpenAiService openAiService;

    public ExplainController(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    @PostMapping("/explain")
    public ResponseEntity<?> explain(@RequestBody ExplainRequest request) {
        System.out.println("=== 진짜 AI 호출 시작 ===");
        try {
            ExplainResponse response = openAiService.explain(request.maskedText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("=== AI 호출 실패: " + e.getMessage() + " ===");
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문서를 분석하는 데 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
        }
    }
}