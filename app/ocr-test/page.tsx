"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";

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
        setText(data.text);
        await worker.terminate();
        setLoading(false);
    };

    return (
        <main className="min-h-screen p-6 flex flex-col items-center gap-4">
            <h1 className="font-display text-2xl">OCR 테스트</h1>

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
