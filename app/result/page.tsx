"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveHistoryItem } from "@/lib/history";

type ExplainResult = {
    summary: string;
    dueDate: string;
    dueDateIso: string;
    actionText: string;
    evidenceSentences: string[];
};

export default function ResultPage() {
    const [result, setResult] = useState<ExplainResult | null>(null);
    const savedHistoryRef = useRef(false);

    useEffect(() => {
        const saved = sessionStorage.getItem("ddobaki_result");
        if (saved) {
            const parsed: ExplainResult = JSON.parse(saved);
            console.log("백엔드에서 받은 결과:", parsed);
            setResult(parsed);

            if (!savedHistoryRef.current) {
                savedHistoryRef.current = true;
                saveHistoryItem(parsed.summary.slice(0, 20), parsed.summary);
            }
        }

        return function cleanup() {
            sessionStorage.removeItem("ddobaki_masked_text");
            sessionStorage.removeItem("ddobaki_result");
        };
    }, []);

    if (!result) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-center relative">
                        <Link href="/confirm" className="absolute left-0">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <div className="text-[15px] font-bold">결과</div>
                    </div>
                    <p className="text-xs text-muted text-center py-8">
                        결과를 불러올 수 없어요. 처음부터 다시 시도해주세요.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-center relative">
                    <Link href="/confirm" className="absolute left-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <div className="text-[15px] font-bold">결과</div>
                </div>

                <div className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5">
                    <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M6 3H15L19 7V21H6V3Z" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M15 3V7H19" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="text-sm font-display leading-relaxed">{result.summary}</p>
                </div>

                {(() => {
                    const actionDisplay =
                        result.actionText ||
                        (result.dueDate ? "정해진 날짜까지 확인해주세요." : "별도로 하실 일은 없어요.");
                    return (
                        <div className="border-[1.5px] border-ink rounded-2xl p-4">
                            <div className="text-[11px] font-bold text-inksoft mb-1.5">내가 해야 할 일</div>
                            <div className="font-display text-lg leading-relaxed">
                                {result.dueDate && <span className="bg-hl px-1 rounded font-extrabold">{result.dueDate}</span>}
                                {result.dueDate && " "}
                                {actionDisplay}
                            </div>
                        </div>
                    );
                })()}

                <div className="bg-white border border-line rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M4 20L14 10L18 14L8 24" stroke="#B23A2E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 10L17 4L20 7L18 14" stroke="#B23A2E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs font-bold text-inksoft">또박이가 형광펜으로 표시해준 문장</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                        {result.evidenceSentences.map(function (sentence, i) {
                            return (
                                <li key={i} className="text-xs text-inksoft bg-hlwash rounded-lg px-2.5 py-1.5 leading-relaxed">
                                    {sentence}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-ok bg-oksoft rounded-full px-3 py-1.5 w-fit mx-auto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L10 18L19 7" stroke="#3F7F52" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    원문 근거 확인됨
                </div>

                <Link href="/home" className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm flex items-center justify-center">
                    확인 끝냈어요
                </Link>
            </div>
        </main>
    );
}