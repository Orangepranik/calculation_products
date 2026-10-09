"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { calcPlan, planPrintJobs } from "@/lib/plan";
import { formatCount, formatGrams, formatLength, formatMinutes, plural } from "@/lib/format";
import { Stat } from "./ProductCalculator";
import { ProductFolder } from "./ProductFolder";
import { PrintersPanel } from "./PrintersPanel";

const segmentsWord = (n: number) => `${formatCount(n)} ${plural(n, ["відрізок", "відрізки", "відрізків"])}`;

export function PlanCalculator({ products }: { products: Product[] }) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const plan = calcPlan(
    products.map((product) => {
      const n = Number.parseInt(qty[product.slug] ?? "", 10);
      return { product, qty: Number.isFinite(n) && n > 0 ? n : 0 };
    }),
    products,
  );

  return (
    <>
      <ul className="mt-8 divide-y divide-neutral-100 border-y border-neutral-100">
        {products.map((p) => (
          <li key={p.slug} className="flex items-center justify-between gap-4 py-3">
            <label htmlFor={`qty-${p.slug}`} className="text-sm">
              {p.name}
              {p.subtitle && <span className="ml-2 text-xs text-neutral-400">{p.subtitle}</span>}
            </label>
            <input
              id={`qty-${p.slug}`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              value={qty[p.slug] ?? ""}
              onChange={(e) => setQty((q) => ({ ...q, [p.slug]: e.target.value }))}
              onFocus={(e) => e.target.select()}
              className="w-24 rounded-lg border border-neutral-200 px-3 py-1.5 text-right text-base tabular-nums outline-none transition-colors focus:border-neutral-900"
            />
          </li>
        ))}
      </ul>

      {plan.products.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-400">Вкажіть кількість хоча б для одного виробу.</p>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Виробів" value={formatCount(plan.devices)} />
            {plan.prints > 0 && (
              <>
                <Stat label="Пластик" value={formatGrams(plan.grams)} note={`повними друками: ${formatGrams(plan.printGrams)}`} />
                <Stat
                  label="Час друку"
                  value={formatMinutes(plan.minutes)}
                  note={`повними друками: ${formatMinutes(plan.printMinutes)}`}
                />
              </>
            )}
            {plan.cablePieces > 0 && (
              <Stat label="Кабель" value={formatLength(plan.cableCm)} note={segmentsWord(plan.cablePieces)} />
            )}
          </div>

          {plan.prints > 0 && <PrintersPanel jobs={planPrintJobs(plan)} />}

          <h2 className="mt-14 text-sm font-medium text-neutral-500">Продукти в плані</h2>
          <div className="mt-4 space-y-3">
            {plan.products.map((p) => (
              <ProductFolder key={p.product.slug} item={p} catalog={products} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
