"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";
import { maskText } from "@/lib/masking";

export default function OcrTestPage() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        setLoading(true);
        setText("");
        setPreview(URL.createObjectURL(file));

        const worker = await createWorker("kor+eng");
        const { data } = await worker.recognize(file);
        const result = maskText(data.text);
        setText(result.masked);
        console.log("발견된 민감정보:", result.found);
        await worker.terminate();
        setLoading(false);
    };

    return (
        <main className="min-h-screen p-6 flex flex-col items-center gap-4">
            <h1 className="font-display text-2xl">OCR 테스트</h1>
            <button
                onClick={() => {
                    const sample = "제 주민번호는 901231-1234567이고 전화번호는 010-1234-5678이에요. 카드번호 1234-5678-9012-3456도 있어요.";
                    const result = maskText(sample);
                    setText(result.masked);
                    console.log("발견:", result.found);
                }}
                className="text-xs underline text-inksoft"
            >
                가짜 데이터로 마스킹 테스트
            </button>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />

            {preview && (
                <img
                    src={preview}
                    alt="미리보기"
                    className="max-w-sm rounded-xl border border-line"
                />
            )}

            {loading && (
                <p className="text-sm text-inksoft">
                    글자를 읽는 중이에요... (처음엔 언어팩 다운로드 때문에 좀 걸려요)
                </p>
            )}

            {text && (
                <pre className="w-full max-w-xl bg-white border border-line rounded-xl p-4 text-xs whitespace-pre-wrap">
                    {text}
                </pre>
            )}
        </main>
    );
}
