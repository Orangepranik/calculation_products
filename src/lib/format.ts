const g2 = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

export function formatGrams(grams: number | null): string {
  return grams === null ? "—" : `${g2.format(grams)} г`;
}

/** 204.5 → "3 ч 24 мин 30 с"; секунды показываем только когда меньше часа */
export function formatMinutes(minutes: number): string {
  const totalSec = Math.round(minutes * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} ч`);
  if (m) parts.push(`${m} мин`);
  if (s && !h) parts.push(`${s} с`);
  return parts.join(" ") || "0 мин";
}
