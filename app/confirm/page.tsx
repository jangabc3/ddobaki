"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmPage() {
    const router = useRouter();
    const preRef = useRef<HTMLPreElement>(null);
    const originalTextRef = useRef<string | null>(null); // 자동 마스킹만 적용된, 최초 상태
    const [text, setText] = useState<string | null>(null);
    const [previousText, setPreviousText] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);

    useEffect(() => {
        const saved = sessionStorage.getItem("ddobaki_masked_text");
        setText(saved);
        if (saved && originalTextRef.current === null) {
            originalTextRef.current = saved; // 딱 한 번만, 처음 불러올 때만 저장해둬요
        }
    }, []);

    const handleTextSelect = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !preRef.current) {
            setSelection(null);
            return;
        }
        const range = sel.getRangeAt(0);
        if (
            range.startContainer !== range.endContainer ||
            !preRef.current.contains(range.startContainer)
        ) {
            setSelection(null);
            return;
        }
        const start = range.startOffset;
        const end = range.endOffset;
        if (start === end || !text) {
            setSelection(null);
            return;
        }
        setSelection({ start, end, text: text.slice(start, end) });
    };

    const applyManualMask = () => {
        if (!selection || !text) return;
        setPreviousText(text);
        const masked = text.slice(0, selection.start) + "●".repeat(selection.end - selection.start) + text.slice(selection.end);
        setText(masked);
        sessionStorage.setItem("ddobaki_masked_text", masked);
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    };

    const undoLastMask = () => {
        if (!previousText) return;
        setText(previousText);
        sessionStorage.setItem("ddobaki_masked_text", previousText);
        setPreviousText(null);
    };

    const resetToAutoMasked = () => {
        if (!originalTextRef.current) return;
        if (!confirm("직접 가린 부분이 전부 취소돼요. 초기화할까요?")) return;
        setText(originalTextRef.current);
        sessionStorage.setItem("ddobaki_masked_text", originalTextRef.current);
        setPreviousText(null);
    };

    const hasManualEdits = originalTextRef.current !== null && text !== originalTextRef.current;

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
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-3">
                <div className="flex items-center justify-center relative">
                    <Link href="/home" className="absolute left-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <div className="text-[15px] font-bold">개인정보 확인</div>
                </div>

                <div className="bg-white border border-line rounded-2xl p-4 max-h-56 overflow-y-auto">
                    <div className="text-[13px] font-extrabold text-center pb-3 border-b border-dashed border-line mb-3">
                        인식된 문서 내용
                    </div>
                    {text === null ? (
                        <p className="text-xs text-muted text-center py-4">불러오는 중...</p>
                    ) : text ? (
                        <pre
                            ref={preRef}
                            onMouseUp={handleTextSelect}
                            onTouchEnd={handleTextSelect}
                            className="text-xs whitespace-pre-wrap leading-relaxed font-body select-text cursor-text"
                        >
                            {text}
                        </pre>
                    ) : (
                        <p className="text-xs text-muted text-center py-4">
                            저장된 문서가 없어요. 홈으로 돌아가 사진을 다시 선택해주세요.
                        </p>
                    )}
                </div>

                {text && (
                    <div className="flex items-center justify-between bg-hlwash rounded-xl px-3 py-2.5 gap-2">
                        <p className="text-[11px] text-inksoft flex-1 truncate">
                            {selection ? `"${selection.text}" 선택됨` : "가릴 부분을 선택(길게 눌러서)하세요"}
                        </p>
                        <button
                            onClick={applyManualMask}
                            disabled={!selection}
                            className="text-xs font-bold bg-ink text-white rounded-lg px-3 py-1.5 disabled:opacity-40 flex-shrink-0"
                        >
                            가리기
                        </button>
                    </div>
                )}

                {(previousText || hasManualEdits) && (
                    <div className="flex gap-2">
                        {previousText && (
                            <button
                                onClick={undoLastMask}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-inksoft bg-white border border-line rounded-xl py-2"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 14L4 9L9 4" stroke="#4B524C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4 9H14C17.3137 9 20 11.6863 20 15C20 18.3137 17.3137 21 14 21H10" stroke="#4B524C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                방금 것만 되돌리기
                            </button>
                        )}
                        {hasManualEdits && (
                            <button
                                onClick={resetToAutoMasked}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-stamp bg-white border rounded-xl py-2"
                                style={{ borderColor: "#B23A2E", color: "#B23A2E" }}
                            >
                                전체 초기화
                            </button>
                        )}
                    </div>
                )}

                <h3 className="font-display text-[15.5px] mt-1">민감한 정보를 가렸어요</h3>
                <p className="text-xs text-inksoft leading-relaxed">
                    주민번호, 전화번호, 카드번호, 계좌번호, 차량번호는 자동으로 가려졌어요. 놓친 부분이 있다면 위에서 직접 선택해서 가려주세요.
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