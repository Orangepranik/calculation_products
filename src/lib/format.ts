const g2 = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 2 });
const int = new Intl.NumberFormat("uk-UA");

/** От 1000 г показываем в кг */
export function formatGrams(grams: number | null): string {
  if (grams === null) return "—";
  return grams >= 1000 ? `${g2.format(grams / 1000)} кг` : `${g2.format(grams)} г`;
}

export function formatCount(n: number): string {
  return int.format(n);
}

/** 204.5 → "3 год 24 хв"; секунды показываем только когда меньше часа */
export function formatMinutes(minutes: number): string {
  const totalSec = Math.round(minutes * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (h) parts.push(`${int.format(h)} год`);
  if (m) parts.push(`${m} хв`);
  if (s && !h) parts.push(`${s} с`);
  return parts.join(" ") || "0 хв";
}

/** От 100 см показываем в метрах */
export function formatLength(cm: number): string {
  return cm >= 100 ? `${g2.format(cm / 100)} м` : `${g2.format(cm)} см`;
}
