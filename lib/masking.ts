export type MaskMatch = {
  type:
    | "주민번호"
    | "전화번호"
    | "카드번호"
    | "계좌번호"
    | "차량번호"
    | "긴숫자";
  original: string;
};

const PATTERNS: {
  type: MaskMatch["type"];
  regex: RegExp;
  mask: (m: string) => string;
}[] = [
  {
    type: "주민번호",
    regex: /\d{6}[-\s]?[1-4]\d{6}/g,
    mask: (m) => {
      const digits = m.replace(/[-\s]/g, "");
      return `${digits.slice(0, 6)}-●●●●●●●`;
    },
  },
  {
    type: "카드번호",
    regex: /\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}/g,
    mask: () => "●●●●-●●●●-●●●●-●●●●",
  },
  {
    type: "전화번호",
    regex: /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g,
    mask: (m) => {
      const digits = m.replace(/[-\s]/g, "");
      return `${digits.slice(0, 3)}-●●●●-●●●●`;
    },
  },
  {
    type: "차량번호",
    regex: /\d{2,3}[가-힣]\s?\d{4}/g,
    mask: () => "●●●●●●",
  },
];

// "계좌"라는 단어 뒤에 나오는 숫자 조합을 계좌번호로 보고 전부 가려요
function maskAccountNumbers(text: string, found: MaskMatch[]): string {
  const accountRegex =
    /(계좌(?:번호)?[^\n0-9]{0,40})([0-9][0-9\-\s]{7,18}[0-9])/g;
  return text.replace(
    accountRegex,
    (_fullMatch, label: string, numberPart: string) => {
      found.push({ type: "계좌번호", original: numberPart.trim() });
      const masked = numberPart.replace(/[0-9]/g, "●");
      return label + masked;
    },
  );
}

// 은행 이름 뒤에 바로 나오는 숫자 조합도 계좌번호(가상계좌 포함)로 보고 가려요
// OCR이 은행명 주변에 노이즈 글자를 끼워넣는 경우가 많아 노이즈 허용 범위를 넉넉히 둠
const BANK_NAMES =
  "신한|국민|우리|하나|농협|기업|산업|씨티|외환|SC제일|수협|새마을금고|신협|우체국|카카오뱅크|카카오뱅|카카오방크|케이뱅크|케이뱀크|토스뱅크|iM뱅크|아이엠뱅크|대구|부산|광주|전북|경남|제주";

function maskBankAccountNumbers(text: string, found: MaskMatch[]): string {
  const bankRegex = new RegExp(
    `(${BANK_NAMES})\\s?(?:은행)?[^\\n0-9]{0,15}([0-9][0-9\\-\\s/]{6,20}[0-9])`,
    "g",
  );
  return text.replace(
    bankRegex,
    (_fullMatch, bankName: string, numberPart: string) => {
      found.push({ type: "계좌번호", original: numberPart.trim() });
      const masked = numberPart.replace(/[0-9]/g, "●");
      return bankName + " " + masked;
    },
  );
}

// 최종 안전망: 위 패턴들이 다 놓치더라도, 숫자가 8자리 이상 이어지면
// 무조건 가려요. 문맥(은행명 등)을 못 찾아도 "긴 숫자 뭉치는 위험하다"고
// 보고 우선 가리는 방식이라, 과잉 마스킹은 감수하되 유출 가능성을 최소화해요.
// 날짜(예: 2026.8.31)나 금액(예: 129,390원)은 보통 숫자가 7자리 이하라
// 그대로 남아 AI 분석에는 지장이 없어요.
function maskLongNumberSequences(text: string, found: MaskMatch[]): string {
  const longNumberRegex = /[0-9][0-9\-.\/ ]{5,}[0-9]/g;
  return text.replace(longNumberRegex, (match) => {
    const digitCount = (match.match(/\d/g) || []).length;
    if (digitCount < 8) return match;
    found.push({ type: "긴숫자", original: match.trim() });
    return match.replace(/[0-9]/g, "●");
  });
}

export function maskText(text: string): { masked: string; found: MaskMatch[] } {
  let masked = text;
  const found: MaskMatch[] = [];

  for (const pattern of PATTERNS) {
    masked = masked.replace(pattern.regex, (match) => {
      found.push({ type: pattern.type, original: match });
      return pattern.mask(match);
    });
  }

  masked = maskAccountNumbers(masked, found);
  masked = maskBankAccountNumbers(masked, found);
  masked = maskLongNumberSequences(masked, found);

  return { masked, found };
}
