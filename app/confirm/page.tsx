"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmPage() {
    const router = useRouter();
    const [text, setText] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const saved = sessionStorage.getItem("ddobaki_masked_text");
        setText(saved);
    }, []);

    const handleConfirm = async () => {
        if (!text) return;
        setSending(true);
        try {
            const res = await fetch("http://localhost:8080/api/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ maskedText: text }),
            });
            if (!res.ok) throw new Error("서버 응답 오류");
            const data = await res.json();
            sessionStorage.setItem("ddobaki_result", JSON.stringify(data));
            router.push("/result");
        } catch (err) {
            console.error(err);
            alert("AI가 문서를 이해하는 데 실패했어요. 다시 시도해주세요.");
            setSending(false);
        }
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
                    <div className="text-[15px] font-bold">개인정보 확인</div>
                </div>

                <div className="bg-white border border-line rounded-2xl p-4 max-h-64 overflow-y-auto">
                    <div className="text-[13px] font-extrabold text-center pb-3 border-b border-dashed border-line mb-3">
                        인식된 문서 내용
                    </div>
                    {text === null ? (
                        <p className="text-xs text-muted text-center py-4">불러오는 중...</p>
                    ) : text ? (
                        <pre className="text-xs whitespace-pre-wrap leading-relaxed font-body">{text}</pre>
                    ) : (
                        <p className="text-xs text-muted text-center py-4">
                            저장된 문서가 없어요. 홈으로 돌아가 사진을 다시 선택해주세요.
                        </p>
                    )}
                </div>

                <h3 className="font-display text-[15.5px]">민감한 정보를 가렸어요</h3>
                <p className="text-xs text-inksoft leading-relaxed">
                    주민번호, 전화번호, 카드번호는 기기 안에서 가려졌고, 이 화면 밖으로 원문 그대로 전송되지 않아요.
                </p>

                <div className="flex items-center gap-1.5 text-xs font-bold text-ok bg-oksoft rounded-full px-3 py-1.5 w-fit mx-auto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L10 18L19 7" stroke="#3F7F52" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    가린 내용만 안전하게 확인해요
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!text || sending}
                    className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm disabled:opacity-60"
                >
                    {sending ? "AI가 읽고 있어요..." : "가린 내용으로 확인할게요"}
                </button>
                <Link href="/home" className="text-xs text-inksoft font-semibold text-center">
                    사진을 다시 선택할게요
                </Link>
            </div>
        </main>
    );
}