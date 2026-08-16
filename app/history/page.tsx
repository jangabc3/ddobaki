import Link from "next/link";

const items = [
    { name: "건강보험료 납부 안내", date: "8월 14일", desc: "8월 31일까지 132,400원 납부하세요." },
    { name: "국민연금 안내문", date: "8월 2일", desc: "예상 연금액 안내예요. 지금 해야 할 일은 없어요." },
    { name: "통신비 청구서", date: "7월 28일", desc: "이번 달 54,900원이 자동으로 이체돼요." },
];

export default function HistoryPage() {
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

                <div className="flex flex-col gap-2.5">
                    {items.map((item) => (
                        <div key={item.name} className="flex items-start gap-3 bg-white border border-line rounded-2xl p-3.5">
                            <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 3H15L19 7V21H6V3Z" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                    <path d="M15 3V7H19" stroke="#14171B" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[13px] font-extrabold">{item.name}</span>
                                    <span className="text-[10.5px] text-muted font-semibold">{item.date}</span>
                                </div>
                                <p className="text-[11.5px] text-inksoft mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="text-xs text-muted font-semibold text-center mt-1">
                    기록 전체 삭제
                </button>
            </div>
        </main>
    );
}