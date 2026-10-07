export type MaterialCategory = "component" | "fastener" | "cut";

export type MaterialItem = {
  name: string;
  /** component — комплектующие, fastener — крепёж, cut — нарезка лент/скотча */
  category: MaterialCategory;
  /** Штук (или отрезков) на одно изделие */
  count: number;
  /** Длина отрезка, см; нет — считается поштучно */
  lengthCm?: number;
};

export type MaterialItemOrder = MaterialItem & { pieces: number; totalCm: number | null };

export type MaterialTotal = {
  name: string;
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

  // Одинаковые позиции из разных строк списка складываем
  const totals = new Map<string, MaterialTotal>();
  for (const r of rows) {
    const t = totals.get(r.name) ?? { name: r.name, category: r.category, count: 0, cm: null, pieces: 0, totalCm: null };
    t.count += r.count;
    t.pieces += r.pieces;
    if (r.lengthCm !== undefined) t.cm = (t.cm ?? 0) + r.lengthCm * r.count;
    if (r.totalCm !== null) t.totalCm = (t.totalCm ?? 0) + r.totalCm;
    totals.set(r.name, t);
  }

  return { rows, totals: [...totals.values()] };
}
