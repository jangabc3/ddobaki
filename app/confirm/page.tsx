import Link from "next/link";

export default function ConfirmPage() {
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

                <div className="bg-white border border-line rounded-2xl p-4">
                    <div className="text-[13px] font-extrabold text-center pb-3 border-b border-dashed border-line mb-3">
                        건강보험료 납부 안내
                    </div>
                    <div className="flex justify-between text-xs py-1">
                        <span className="text-muted font-semibold">납부 기한</span>
                        <span className="font-bold">2026. 8. 31.</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                        <span className="text-muted font-semibold">납부 금액</span>
                        <span className="font-bold">132,400원</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                        <span className="text-muted font-semibold">납부 대상</span>
                        <span className="font-bold">지역가입자</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 pb-3 border-b border-dashed border-line mb-1">
                        <span className="text-muted font-semibold">납부 방법</span>
                        <span className="font-bold">은행, 카드, 인터넷지로 등</span>
                    </div>

                    <div className="flex justify-between items-center text-xs py-2">
                        <span className="text-muted font-semibold w-14">이름</span>
                        <span className="bg-ink text-white font-bold rounded-md px-2.5 py-1 text-[11.5px]">홍●동</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2">
                        <span className="text-muted font-semibold w-14">주민번호</span>
                        <span className="bg-ink text-white font-bold rounded-md px-2.5 py-1 text-[11.5px]">●●●●●●-●●●●●●●</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2">
                        <span className="text-muted font-semibold w-14">계좌번호</span>
                        <span className="bg-ink text-white font-bold rounded-md px-2.5 py-1 text-[11.5px]">●●●-●●-●●●●●●</span>
                    </div>
                </div>

                <h3 className="font-display text-[15.5px]">민감한 정보 3곳을 가렸어요</h3>
                <p className="text-xs text-inksoft leading-relaxed">
                    이름, 주민번호, 계좌번호는 기기 안에서 가려졌고, 이 화면 밖으로 원문 그대로 전송되지 않아요.
                </p>

                <div className="flex items-center gap-1.5 text-xs font-bold text-ok bg-oksoft rounded-full px-3 py-1.5 w-fit mx-auto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L10 18L19 7" stroke="#3F7F52" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    가린 내용만 안전하게 확인해요
                </div>

                <Link href="/result" className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm flex items-center justify-center">
                    가린 내용으로 확인할게요
                </Link>
                <Link href="/home" className="text-xs text-inksoft font-semibold text-center">
                    사진을 다시 선택할게요
                </Link>
            </div>
        </main>
    );
}