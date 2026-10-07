export type WireColor = "червоний" | "білий" | "чорний" | "жовтий";

export type WireCut = {
  /** Узел, для которого режется провод (PRODUCT1…) */
  group: string;
  gauge: string;
  /** Первый цвет — основной, остальные — допустимая замена */
  colors: [WireColor, ...WireColor[]];
  lengthCm: number;
  /** Отрезков на одно изделие */
  count: number;
};

export type WireCutOrder = WireCut & { pieces: number; totalCm: number };

export type WireTotal = {
  gauge: string;
  color: WireColor;
  pieces: number;
  totalCm: number;
  /** Часть длины, которую можно заменить другим цветом */
  replaceableCm: number;
};

export type WiresCalc = { cuts: WireCutOrder[]; totals: WireTotal[]; totalPieces: number };

export function calcWires(cuts: WireCut[], devices: number): WiresCalc {
  const rows = cuts.map((c) => ({ ...c, pieces: c.count * devices, totalCm: c.lengthCm * c.count * devices }));

  const totals = new Map<string, WireTotal>();
  for (const r of rows) {
    const color = r.colors[0];
    const key = `${r.gauge}|${color}`;
    const t = totals.get(key) ?? { gauge: r.gauge, color, pieces: 0, totalCm: 0, replaceableCm: 0 };
    t.pieces += r.pieces;
    t.totalCm += r.totalCm;
    if (r.colors.length > 1) t.replaceableCm += r.totalCm;
    totals.set(key, t);
  }

  return {
    cuts: rows,
    totals: [...totals.values()].sort((a, b) => a.gauge.localeCompare(b.gauge) || a.color.localeCompare(b.color, "uk")),
    totalPieces: rows.reduce((s, r) => s + r.pieces, 0),
  };
}
