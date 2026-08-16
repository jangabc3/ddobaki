"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createWorker } from "tesseract.js";
import { maskText } from "@/lib/masking";

export default function HomePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleFile = async (file: File) => {
        setLoading(true);
        try {
            const worker = await createWorker("kor");
            const { data } = await worker.recognize(file);
            await worker.terminate();

            const { masked } = maskText(data.text);
            sessionStorage.setItem("ddobaki_masked_text", masked);

            router.push("/confirm");
        } catch (err) {
            console.error(err);
            alert("문서를 읽는 데 실패했어요. 다시 시도해주세요.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="font-display text-xl">또박이</div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" stroke="#14171B" strokeWidth="1.6" />
                        <path d="M19.4 13.5C19.5 13 19.5 12.5 19.4 12L21 10.5L19.5 8L17.5 8.7C17 8.3 16.4 8 15.8 7.8L15.5 6H12.5L12.2 7.8C11.6 8 11 8.3 10.5 8.7L8.5 8L7 10.5L8.6 12C8.5 12.5 8.5 13 8.6 13.5L7 15L8.5 17.5L10.5 16.8C11 17.2 11.6 17.5 12.2 17.7L12.5 19.5H15.5L15.8 17.7C16.4 17.5 17 17.2 17.5 16.8L19.5 17.5L21 15L19.4 13.5Z" stroke="#14171B" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1 className="font-display text-2xl leading-relaxed">
                    어려운 안내문,<br />또박또박 읽어드릴게요.
                </h1>
                <p className="text-sm text-inksoft leading-relaxed">
                    사진을 넣으면 중요한 부분만<br />형광펜으로 표시해 알려드려요.
                </p>

                <div className="bg-white border border-line rounded-3xl p-4 relative flex flex-col gap-2">
                    <div className="h-2.5 rounded bg-line w-1/2 opacity-60" />
                    <div className="h-2 rounded bg-line w-11/12" />
                    <div className="h-2 rounded bg-hl w-3/4" />
                    <div className="h-2 rounded bg-line w-4/5" />
                    <div className="h-2 rounded bg-line w-3/5" />
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />

                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm disabled:opacity-60"
                    >
                        {loading ? "문서를 읽는 중이에요..." : "사진에서 가져오기"}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full h-[50px] rounded-2xl bg-white border border-line font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 8H7L9 5H15L17 8H20V19H4V8Z" stroke="#14171B" strokeWidth="1.6" strokeLinejoin="round" />
                            <circle cx="12" cy="13" r="3.2" stroke="#14171B" strokeWidth="1.6" />
                        </svg>
                        카메라로 찍기
                    </button>
                </div>

                <Link href="/history" className="flex items-center justify-between bg-white border border-line rounded-2xl px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-hlwash flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15.5 9.2" stroke="#14171B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="9" stroke="#14171B" strokeWidth="1.4" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold">이번 달 3건 확인</div>
                            <div className="text-[11px] text-muted">가장 최근: 건강보험료 안내</div>
                        </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6L15 12L9 18" stroke="#8B9088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>

                <p className="text-[11px] text-muted text-center">원본은 확인이 끝나면 자동으로 삭제돼요</p>
            </div>
        </main>
    );
}