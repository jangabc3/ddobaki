package com.ddobaki.backend.dto;

import java.util.List;

public record ExplainResponse(
        String summary,
        String dueDate,
        String dueDateIso,
        String actionText,
        List<String> evidenceSentences) {
}