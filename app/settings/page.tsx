"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearHistory } from "@/lib/history";
import { TEXT_SCALE_LEVELS, TextScaleLevel, applyTextScale } from "@/components/FontSizeToggle";

const LEVEL_LABEL: Record<TextScaleLevel, string> = {
    normal: "보통",
    large: "큰 글씨",
    xlarge: "아주 큰 글씨",
};

export default function SettingsPage() {
    const [level, setLevel] = useState<TextScaleLevel>("normal");

    useEffect(() => {
        const saved = localStorage.getItem("ddobaki_text_scale") as TextScaleLevel | null;
        if (saved) setLevel(saved);
    }, []);

    const handleSelectLevel = (next: TextScaleLevel) => {
        setLevel(next);
        applyTextScale(next);
    };

    const handleClearHistory = () => {
        if (!confirm("모든 기록을 지울까요? 되돌릴 수 없어요.")) return;
        clearHistory();
        alert("기록을 전부 지웠어요.");
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-center relative">
                    <Link href="/home" className="absolute left-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <div className="text-[15px] font-bold">설정</div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="bg-white border border-line rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-sm">가</span>
                            </div>
                            <span className="text-xs font-bold text-inksoft">글자 크기</span>
                        </div>
                        <div className="flex gap-2">
                            {TEXT_SCALE_LEVELS.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => handleSelectLevel(l)}
                                    className={
                                        "flex-1 h-[42px] rounded-xl text-xs font-bold border " +
                                        (level === l ? "bg-ink text-white border-ink" : "bg-white text-inksoft border-line")
                                    }
                                >
                                    {LEVEL_LABEL[l]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-line rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L4 5V11C4 16 7.4 20.4 12 22C16.6 20.4 20 16 20 11V5L12 2Z" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-inksoft">개인정보 처리방침</span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed">
                            사진 원본은 서버에 저장되지 않아요. 개인정보는 기기 안에서 먼저 가려진 뒤, 가려진 내용만 AI로 전송돼요. 확인이 끝나면 원본과 분석 내용은 즉시 삭제돼요.
                        </p>
                    </div>

                    <div className="bg-white border border-line rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <span className="font-display text-sm">또</span>
                            </div>
                            <span className="text-xs font-bold text-inksoft">또박이 소개</span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed">
                            어려운 안내문을 안전하게, 쉬운 말로 풀어드리는 서비스예요.<br />
                            버전 0.1
                        </p>
                        <button onClick={handleClearHistory} className="text-[10.5px] text-muted underline mt-3">
                            기록 전체 삭제
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}