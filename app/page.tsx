import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-6">
        <div className="mx-auto w-16 h-16 flex items-center justify-center">
          <svg viewBox="0 0 76 76" className="w-16 h-16">
            <g transform="rotate(-7 38 38)">
              <circle cx="38" cy="38" r="32" stroke="#B23A2E" strokeWidth="2.4" strokeDasharray="4 2.4" fill="none" />
              <circle cx="38" cy="38" r="24" stroke="#B23A2E" strokeWidth="1.4" fill="none" />
              <text x="38" y="35" textAnchor="middle" fontSize="12" fontWeight="800" fill="#B23A2E">확인</text>
              <text x="38" y="48" textAnchor="middle" fontSize="8.5" fill="#B23A2E">또박이</text>
            </g>
          </svg>
        </div>

        <h1 className="font-display text-2xl text-center leading-relaxed">
          사진은 서버에<br />저장되지 않아요
        </h1>
        <p className="text-sm text-inksoft text-center leading-relaxed">
          개인정보는 이 기기 안에서 먼저 가려요.<br />가려진 내용만 안전하게 전송돼요.
        </p>

        <div className="flex flex-col gap-2.5">
          {["기기 안에서 먼저 가림 처리", "가려진 정보만 AI로 전송", "확인이 끝나면 자동으로 삭제"].map((text, i) => (
            <div key={text} className="flex items-center gap-3 bg-white border border-line rounded-2xl px-3.5 py-3">
              <div className="w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-xs font-semibold">{text}</p>
            </div>
          ))}
        </div>

        <Link href="/home" className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm flex items-center justify-center">
          시작할게요
        </Link>
        <button className="text-xs text-inksoft font-semibold text-center">
          개인정보 처리방침 보기
        </button>
      </div>
    </main>
  );
}