"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResultPage() {
    const [tab, setTab] = useState<"easy" | "source">("easy");

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

                {/* 탭 전환 버튼 */}
                <div className="flex bg-white border border-line rounded-xl p-1">
                    <button
                        onClick={() => setTab("easy")}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg ${tab === "easy" ? "bg-ink text-white" : "text-muted"
                            }`}
                    >
                        쉬운 설명
                    </button>
                    <button
                        onClick={() => setTab("source")}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg ${tab === "source" ? "bg-ink text-white" : "text-muted"
                            }`}
                    >
                        원문 근거
                    </button>
                </div>

                {tab === "easy" ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5">
                            <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 3H15L19 7V21H6V3Z" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                    <path d="M15 3V7H19" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-display leading-relaxed">
                                이번 달 건강보험료를 납부해 달라는 안내예요.
                            </p>
                        </div>

                        <div className="border-[1.5px] border-ink rounded-2xl p-4">
                            <div className="text-[11px] font-bold text-inksoft mb-1.5">내가 해야 할 일</div>
                            <div className="font-display text-lg leading-relaxed">
                                <span className="bg-hl px-1 rounded font-extrabold">8월 31일까지</span> 132,400원을 납부하세요.
                            </div>
                        </div>

                        <div className="bg-white border border-line rounded-2xl p-3.5">
                            <div className="text-xs font-bold text-inksoft mb-1.5">어려운 말</div>
                            <div className="text-xs">
                                <span className="font-extrabold">연체금</span>{" "}
                                <span className="text-inksoft">— 기한을 넘기면 추가로 내는 금액이에요.</span>
                            </div>
                        </div>

                        <button className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm mt-1">
                            일정에 추가하기
                        </button>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-ok bg-oksoft rounded-full px-3 py-1.5 w-fit mx-auto">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 13L10 18L19 7" stroke="#3F7F52" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            원문 근거 확인됨
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-inksoft">설명에 사용한 문장을 표시했어요.</p>

                        <div className="bg-white border border-line rounded-2xl p-4">
                            <div className="text-[13px] font-extrabold text-center pb-3 border-b border-dashed border-line mb-3">
                                건강보험료 납부 안내
                            </div>
                            <div className="flex justify-between text-xs py-1.5">
                                <span className="text-muted font-semibold">납부 기한</span>
                                <span className="bg-hlwash font-bold px-1.5 rounded">2026. 8. 31.</span>
                            </div>
                            <div className="flex justify-between text-xs py-1.5">
                                <span className="text-muted font-semibold">납부 금액</span>
                                <span className="bg-hlwash font-bold px-1.5 rounded">132,400원</span>
                            </div>
                            <div className="flex justify-between text-xs py-1.5">
                                <span className="text-muted font-semibold">납부 대상</span>
                                <span className="font-bold">지역가입자</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white border border-line rounded-xl px-3.5 py-3 text-xs font-bold">
                            <span>8월 31일까지</span>
                            <span className="text-muted font-normal">→</span>
                            <span>납부 기한</span>
                        </div>
                        <div className="flex items-center justify-between bg-white border border-line rounded-xl px-3.5 py-3 text-xs font-bold">
                            <span>132,400원</span>
                            <span className="text-muted font-normal">→</span>
                            <span>납부 금액</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-ok bg-oksoft rounded-full px-3 py-1.5 w-fit mx-auto mt-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 13L10 18L19 7" stroke="#3F7F52" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            확실하지 않은 내용은 추측하지 않아요
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