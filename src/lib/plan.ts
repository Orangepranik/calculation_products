import type { PrintJob } from "./schedule";
import { calcOrder } from "./calc";
import { calcWires } from "./wires";
import { countPositions } from "./positions";
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

/** Краткая сводка по одному продукту плана */
export type PlanProduct = Totals & PlanLine & { positions: number };

export type PlanCalc = Totals & { products: PlanProduct[]; devices: number };

function summarize({ product, qty }: PlanLine): PlanProduct {
  const order = product.parts ? calcOrder(product.parts, qty) : null;
  const wires = product.wires ? calcWires(product.wires, qty) : null;
  return {
    product,
    qty,
    positions: countPositions(product).reduce((s, x) => s + x.count, 0),
    grams: order?.totalGrams ?? 0,
    printGrams: order?.totalPrintGrams ?? 0,
    minutes: order?.totalMinutes ?? 0,
    printMinutes: order?.totalPrintMinutes ?? 0,
    prints: order?.totalPrints ?? 0,
    cableCm: wires?.totals.reduce((s, t) => s + t.totalCm, 0) ?? 0,
    cablePieces: wires?.totalPieces ?? 0,
  };
}

export function calcPlan(lines: PlanLine[]): PlanCalc {
  const products = lines.filter((l) => l.qty > 0).map(summarize);
  const sum = (f: (p: PlanProduct) => number) => products.reduce((s, p) => s + f(p), 0);
  return {
    products,
    devices: sum((p) => p.qty),
    grams: sum((p) => p.grams),
    printGrams: sum((p) => p.printGrams),
    minutes: sum((p) => p.minutes),
    printMinutes: sum((p) => p.printMinutes),
    prints: sum((p) => p.prints),
    cableCm: sum((p) => p.cableCm),
    cablePieces: sum((p) => p.cablePieces),
  };
}

/** Все печати плана (полными партиями) — для раскладки по принтерам */
export function planPrintJobs(plan: PlanCalc): PrintJob[] {
  return plan.products.flatMap(({ product, qty }) =>
    product.parts
      ? calcOrder(product.parts, qty).parts.flatMap((p) =>
          Array.from({ length: p.prints }, () => ({ label: `${product.name} · ${p.name}`, minutes: p.batch.minutes })),
        )
      : [],
  );
}
