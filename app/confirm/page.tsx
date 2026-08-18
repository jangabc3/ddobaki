"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function ConfirmPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [text, setText] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setText(sessionStorage.getItem("ddobaki_masked_text"));
        setImageUrl(sessionStorage.getItem("ddobaki_redacted_image"));
    }, []);

    const handleConfirm = async () => {
        if (!text) return;
        setSending(true);
        try {
            const res = await fetch("https://ddobaki-production.up.railway.app/api/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ maskedText: text }),
            });
            if (!res.ok) {
                showToast("지금은 AI가 답을 주지 못했어요. 잠시 후 다시 시도해주세요.");
                setSending(false);
                return;
            }
            const data = await res.json();
            sessionStorage.setItem("ddobaki_result", JSON.stringify(data));
            sessionStorage.removeItem("ddobaki_redacted_image");
            router.push("/result");
        } catch (err) {
            console.error(err);
            if (err instanceof TypeError) {
                showToast("인터넷 연결을 확인해주세요. 와이파이나 데이터가 꺼져있지 않은지 봐주세요.");
            } else {
                showToast("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
            }
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

                {imageUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-line">
                        <img src={imageUrl} alt="가려진 문서" className="w-full h-auto block" />
                    </div>
                ) : (
                    <p className="text-xs text-muted text-center py-8">
                        불러올 사진이 없어요. 홈으로 돌아가 사진을 다시 선택해주세요.
                    </p>
                )}

                <h3 className="font-display text-[15.5px]">직접 가린 부분이 검게 보여요</h3>
                <p className="text-xs text-inksoft leading-relaxed">
                    가려진 부분은 이 화면 밖으로 원문 그대로 전송되지 않아요. 놓친 부분이 있다면 뒤로 가서 다시 가려주세요.
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