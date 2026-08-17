export type HistoryItem = {
  id: string;
  title: string;
  dateIso: string;
  summary: string;
};

const KEY = "ddobaki_history";

export function saveHistoryItem(title: string, summary: string) {
  const items = getHistory();
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    title: title.slice(0, 30),
    dateIso: new Date().toISOString().slice(0, 10),
    summary: summary.slice(0, 60),
  };
  const updated = [newItem, ...items].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function countThisMonth(items: HistoryItem[]): number {
  const ym = new Date().toISOString().slice(0, 7);
  return items.filter((i) => i.dateIso.startsWith(ym)).length;
}

export function formatDateKo(dateIso: string): string {
  const d = new Date(dateIso);
  return d.getMonth() + 1 + "월 " + d.getDate() + "일";
}
