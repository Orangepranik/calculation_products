import { calcMaterials, type MaterialCategory, type Segment } from "./bom";
import { calcOrder, type PartOrder } from "./calc";
import { calcWires, type WireColor } from "./wires";
import type { Product } from "@/data/products";

export type PlanLine = { product: Product; qty: number };

/** Сколько пришлось на каждый продукт плана */
export type Contribution = { product: string; pieces: number; totalCm: number | null };

export type PlanMaterial = {
  key: string;
  name: string;
  code?: string;
  /** Для позиций с внутренним кодом PRODUCTn — чей это код (у каждого продукта свои) */
  scopeProduct?: string;
  category: MaterialCategory;
  productSlug?: string;
  madeInHouse?: boolean;
  pieces: number;
  totalCm: number | null;
  /** Отрезки на весь план */
  segments: Segment[];
  by: Contribution[];
};

export type PlanPrintRow = PartOrder & { product: string };

export type PlanWire = {
  gauge: string;
  color: WireColor;
  pieces: number;
  totalCm: number;
  replaceableCm: number;
  by: Contribution[];
};

export type PlanCalc = {
  lines: PlanLine[];
  devices: number;
  print: {
    rows: PlanPrintRow[];
    minutes: number;
    grams: number;
    printMinutes: number;
    printGrams: number;
    prints: number;
  };
  wires: PlanWire[];
  materials: PlanMaterial[];
  /** Изделия и детали своего производства, которые входят в другие изделия */
  madeInHouse: PlanMaterial[];
};

/** Внутренние коды (PRODUCT7, PRODUCT22…) у каждого продукта свои — между продуктами не складываем */
const isScoped = (name: string, code?: string) => code !== undefined || /^PRODUCT\d+$/.test(name);

function addSegments(into: Segment[], segments: Segment[], multiplier: number) {
  for (const s of segments) {
    const same = into.find((x) => x.lengthCm === s.lengthCm);
    if (same) same.count += s.count * multiplier;
    else into.push({ lengthCm: s.lengthCm, count: s.count * multiplier });
  }
}

export function calcPlan(allLines: PlanLine[]): PlanCalc {
  const lines = allLines.filter((l) => l.qty > 0);

  const print: PlanCalc["print"] = { rows: [], minutes: 0, grams: 0, printMinutes: 0, printGrams: 0, prints: 0 };
  const wires = new Map<string, PlanWire>();
  const materials = new Map<string, PlanMaterial>();

  for (const { product, qty } of lines) {
    if (product.parts) {
      const order = calcOrder(product.parts, qty);
      print.rows.push(...order.parts.map((p) => ({ ...p, product: product.name })));
      print.minutes += order.totalMinutes;
      print.grams += order.totalGrams;
      print.printMinutes += order.totalPrintMinutes;
      print.printGrams += order.totalPrintGrams;
      print.prints += order.totalPrints;
    }

    if (product.wires) {
      for (const t of calcWires(product.wires, qty).totals) {
        const key = `${t.gauge}|${t.color}`;
        const w = wires.get(key) ?? { gauge: t.gauge, color: t.color, pieces: 0, totalCm: 0, replaceableCm: 0, by: [] };
        w.pieces += t.pieces;
        w.totalCm += t.totalCm;
        w.replaceableCm += t.replaceableCm;
        w.by.push({ product: product.name, pieces: t.pieces, totalCm: t.totalCm });
        wires.set(key, w);
      }
    }

    if (product.materials) {
      for (const t of calcMaterials(product.materials, qty).totals) {
        const scoped = isScoped(t.name, t.code);
        const key = scoped ? `${product.slug}|${t.code ?? t.name}` : t.name;
        const m = materials.get(key) ?? {
          key,
          name: t.name,
          code: t.code,
          scopeProduct: scoped ? product.name : undefined,
          category: t.madeInHouse ? "component" : t.category,
          productSlug: t.productSlug,
          pieces: 0,
          totalCm: null,
          segments: [],
          by: [],
          madeInHouse: t.madeInHouse,
        };
        m.pieces += t.pieces;
        if (t.totalCm !== null) m.totalCm = (m.totalCm ?? 0) + t.totalCm;
        addSegments(m.segments, t.segments, qty);
        const own = m.by.find((b) => b.product === product.name);
        if (own) {
          own.pieces += t.pieces;
          if (t.totalCm !== null) own.totalCm = (own.totalCm ?? 0) + t.totalCm;
        } else {
          m.by.push({ product: product.name, pieces: t.pieces, totalCm: t.totalCm });
        }
        materials.set(key, m);
      }
    }
  }

  const all = [...materials.values()];
  return {
    lines,
    devices: lines.reduce((s, l) => s + l.qty, 0),
    print,
    wires: [...wires.values()].sort((a, b) => a.gauge.localeCompare(b.gauge) || a.color.localeCompare(b.color, "uk")),
    materials: all.filter((m) => !m.madeInHouse),
    madeInHouse: all.filter((m) => m.madeInHouse),
  };
}
