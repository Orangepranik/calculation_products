export type MaterialCategory = "component" | "fastener" | "cut" | "packaging";

export type MaterialItem = {
  /** Название для сайта */
  name: string;
  /** Внутренний код в системе фирмы, если отличается от названия (PRODUCT22 → "Термоусадка") */
  code?: string;
  /** component — комплектующие, fastener — крепёж, cut — нарезка на отрезки, packaging — упаковка и документы */
  category: MaterialCategory;
  /** Штук (или отрезков) на одно изделие */
  count: number;
  /** Длина отрезка, см; нет — считается поштучно */
  lengthCm?: number;
};

export type MaterialItemOrder = MaterialItem & { pieces: number; totalCm: number | null };

export type MaterialTotal = {
  name: string;
  code?: string;
  category: MaterialCategory;
  /** На одно изделие */
  count: number;
  cm: number | null;
  /** На заказ */
  pieces: number;
  totalCm: number | null;
};

export function calcMaterials(items: MaterialItem[], devices: number) {
  const rows: MaterialItemOrder[] = items.map((m) => ({
    ...m,
    pieces: m.count * devices,
    totalCm: m.lengthCm === undefined ? null : m.lengthCm * m.count * devices,
  }));

  // Одинаковые позиции (по коду, иначе по названию) из разных строк списка складываем
  const totals = new Map<string, MaterialTotal>();
  for (const r of rows) {
    const key = r.code ?? r.name;
    const t = totals.get(key) ?? { name: r.name, code: r.code, category: r.category, count: 0, cm: null, pieces: 0, totalCm: null };
    t.count += r.count;
    t.pieces += r.pieces;
    if (r.lengthCm !== undefined) t.cm = (t.cm ?? 0) + r.lengthCm * r.count;
    if (r.totalCm !== null) t.totalCm = (t.totalCm ?? 0) + r.totalCm;
    totals.set(key, t);
  }

  return { rows, totals: [...totals.values()] };
}
