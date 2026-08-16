"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ExplainResult = {
    summary: string;
    dueDate: string;
    amount: string;
    evidenceSentences: string[];
};

export default function ResultPage() {
    const [result, setResult] = useState<ExplainResult | null>(null);

    useEffect(() => {
        const saved = sessionStorage.getItem("ddobaki_result");
        if (saved) setResult(JSON.parse(saved));
    }, []);

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

                {!result ? (
                    <p className="text-xs text-muted text-center py-8">
                        결과를 불러올 수 없어요. 처음부터 다시 시도해주세요.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5">
                            <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 3H15L19 7V21H6V3Z" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                    <path d="M15 3V7H19" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-display leading-relaxed">{result.summary}</p>
                        </div>

                        {(result.dueDate || result.amount) && (
                            <div className="border-[1.5px] border-ink rounded-2xl p-4">
                                <div className="text-[11px] font-bold text-inksoft mb-1.5">내가 해야 할 일</div>
                                <div className="font-display text-lg leading-relaxed">
                                    {result.dueDate && <span className="bg-hl px-1 rounded font-extrabold">{result.dueDate}</span>}
                                    {result.dueDate && result.amount && " "}
                                    {result.amount && `${result.amount}을 확인하세요.`}
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-line rounded-2xl p-3.5">
                            <div className="text-xs font-bold text-inksoft mb-2">AI가 근거로 사용한 문장</div>
                            <ul className="flex flex-col gap-1.5">
                                {result.evidenceSentences.map((sentence, i) => (
                                    <li key={i} className="text-xs text-inksoft bg-hlwash rounded-lg px-2.5 py-1.5 leading-relaxed">
                                        {sentence}
                                    </li>
                                ))}
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
                )}
            </div>
        </main>
    );
}