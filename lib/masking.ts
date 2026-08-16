export type MaskMatch = {
  type: "주민번호" | "전화번호" | "카드번호";
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
      return `${digits.slice(0, 3)}-●●●●-${digits.slice(-4)}`;
    },
  },
];

export function maskText(text: string): { masked: string; found: MaskMatch[] } {
  let masked = text;
  const found: MaskMatch[] = [];

  for (const pattern of PATTERNS) {
    masked = masked.replace(pattern.regex, (match) => {
      found.push({ type: pattern.type, original: match });
      return pattern.mask(match);
    });
  }

  return { masked, found };
}
