"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory, formatDateKo, HistoryItem } from "@/lib/history";

export default function HistoryPage() {
    const [items, setItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setItems(getHistory());
    }, []);

    const handleClearAll = () => {
        if (!confirm("기록을 전부 지울까요? 되돌릴 수 없어요.")) return;
        clearHistory();
        setItems([]);
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
                    <div className="text-[15px] font-bold">기록</div>
                </div>

                <p className="text-xs text-muted">가린 정보만 보관돼요. 원본은 남지 않아요.</p>

                {items.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2">
                        <p className="text-sm text-inksoft font-semibold">아직 확인한 문서가 없어요</p>
                        <p className="text-xs text-muted">홈에서 사진을 확인하면 여기에 쌓여요</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 bg-white border border-line rounded-2xl p-3.5">
                                <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 3H15L19 7V21H6V3Z" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M15 3V7H19" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[13px] font-extrabold">{item.title}</span>
                                        <span className="text-[10.5px] text-muted font-semibold">{formatDateKo(item.dateIso)}</span>
                                    </div>
                                    <p className="text-[11.5px] text-inksoft mt-1 leading-relaxed">{item.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {items.length > 0 && (
                    <button onClick={handleClearAll} className="text-xs text-muted font-semibold text-center mt-1">
                        기록 전체 삭제
                    </button>
                )}
            </div>
        </main>
    );
}