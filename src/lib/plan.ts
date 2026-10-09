import type { PrintJob } from "./schedule";
import { calcOrder } from "./calc";
import { calcWires } from "./wires";
import { countPositions } from "./positions";
import { expand } from "./assembly";
import type { Product } from "@/data/products";

export type PlanLine = { product: Product; qty: number };

type Totals = {
  grams: number;
  printGrams: number;
  minutes: number;
  printMinutes: number;
  prints: number;
  cableCm: number;
  cablePieces: number;
};

/** Краткая сводка по продукту: вместе с изделиями своего производства, которые в него входят */
export type PlanProduct = Totals &
  PlanLine & {
    /** Позиций для сборки самого продукта */
    positions: number;
    /** Вложенные изделия своего производства и их количество на эту строку */
    subs: PlanLine[];
  };

export type PlanCalc = Totals & { products: PlanProduct[]; devices: number; catalog: Product[] };

const zero: Totals = { grams: 0, printGrams: 0, minutes: 0, printMinutes: 0, prints: 0, cableCm: 0, cablePieces: 0 };

/** Итоги одного продукта без вложенных изделий */
function ownTotals({ product, qty }: PlanLine): Totals {
  const order = product.parts ? calcOrder(product.parts, qty) : null;
  const wires = product.wires ? calcWires(product.wires, qty) : null;
  return {
    grams: order?.totalGrams ?? 0,
    printGrams: order?.totalPrintGrams ?? 0,
    minutes: order?.totalMinutes ?? 0,
    printMinutes: order?.totalPrintMinutes ?? 0,
    prints: order?.totalPrints ?? 0,
    cableCm: wires?.totals.reduce((s, t) => s + t.totalCm, 0) ?? 0,
    cablePieces: wires?.totalPieces ?? 0,
  };
}

function add(a: Totals, b: Totals): Totals {
  return {
    grams: a.grams + b.grams,
    printGrams: a.printGrams + b.printGrams,
    minutes: a.minutes + b.minutes,
    printMinutes: a.printMinutes + b.printMinutes,
    prints: a.prints + b.prints,
    cableCm: a.cableCm + b.cableCm,
    cablePieces: a.cablePieces + b.cablePieces,
  };
}

/** Одинаковые продукты (например, Антена 5G отдельно и внутри КОЖАН) складываем — печатаются общими партиями */
function mergeBySlug(lines: PlanLine[]): PlanLine[] {
  const merged = new Map<string, PlanLine>();
  for (const l of lines) {
    const m = merged.get(l.product.slug);
    if (m) m.qty += l.qty;
    else merged.set(l.product.slug, { product: l.product, qty: l.qty });
  }
  return [...merged.values()];
}

export function summarize(line: PlanLine, catalog: Product[]): PlanProduct {
  const [, ...subs] = expand(line.product, line.qty, catalog);
  return {
    ...mergeBySlug([line, ...subs]).map(ownTotals).reduce(add, zero),
    product: line.product,
    qty: line.qty,
    positions: countPositions(line.product).reduce((s, x) => s + x.count, 0),
    subs: mergeBySlug(subs),
  };
}

/** Все строки плана, развёрнутые во вложенные изделия и сложенные по продукту */
function expandedLines(lines: PlanLine[], catalog: Product[]): PlanLine[] {
  return mergeBySlug(lines.flatMap((l) => expand(l.product, l.qty, catalog)));
}

export function calcPlan(allLines: PlanLine[], catalog: Product[]): PlanCalc {
  const lines = allLines.filter((l) => l.qty > 0);
  return {
    ...expandedLines(lines, catalog).map(ownTotals).reduce(add, zero),
    products: lines.map((l) => summarize(l, catalog)),
    devices: lines.reduce((s, l) => s + l.qty, 0),
    catalog,
  };
}

/** Все печати плана (полными партиями), включая вложенные изделия — для раскладки по принтерам */
export function planPrintJobs(plan: PlanCalc): PrintJob[] {
  return expandedLines(plan.products, plan.catalog).flatMap(({ product, qty }) =>
    product.parts
      ? calcOrder(product.parts, qty).parts.flatMap((p) =>
          Array.from({ length: p.prints }, () => ({ label: `${product.name} · ${p.name}`, minutes: p.batch.minutes })),
        )
      : [],
  );
}
