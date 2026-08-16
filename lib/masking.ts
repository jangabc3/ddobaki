export type MaskMatch = {
  type: "주민번호" | "전화번호" | "카드번호" | "계좌번호" | "차량번호";
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

function maskAccountNumbers(text: string, found: MaskMatch[]): string {
  // "계좌"라는 단어 뒤에 나오는 숫자 조합을 계좌번호로 보고 전부 가려요
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

  return { masked, found };
}
