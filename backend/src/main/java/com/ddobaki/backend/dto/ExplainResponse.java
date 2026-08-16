package com.ddobaki.backend.dto;

import java.util.List;

public record ExplainResponse(
        String summary,
        String dueDate,
        String amount,
        List<String> evidenceSentences) {
}