package com.ddobaki.backend.controller;

import com.ddobaki.backend.dto.ExplainRequest;
import com.ddobaki.backend.dto.ExplainResponse;
import com.ddobaki.backend.service.OpenAiService;
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
    public ExplainResponse explain(@RequestBody ExplainRequest request) {
        System.out.println("=== 진짜 AI 호출 시작 ===");
        return openAiService.explain(request.maskedText());
    }
}