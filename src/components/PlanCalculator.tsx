"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { calcPlan, planPrintJobs, type PlanProduct } from "@/lib/plan";
import { formatCount, formatGrams, formatLength, formatMinutes, plural } from "@/lib/format";
import { ProductSections, pluralDevices, Stat } from "./ProductCalculator";
import { PrintersPanel } from "./PrintersPanel";

const segmentsWord = (n: number) => `${formatCount(n)} ${plural(n, ["відрізок", "відрізки", "відрізків"])}`;

export function PlanCalculator({ products }: { products: Product[] }) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const plan = calcPlan(
    products.map((product) => {
      const n = Number.parseInt(qty[product.slug] ?? "", 10);
      return { product, qty: Number.isFinite(n) && n > 0 ? n : 0 };
    }),
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
              <ProductFolder
                key={p.product.slug}
                item={p}
                open={open[p.product.slug] ?? false}
                onToggle={() => setOpen((o) => ({ ...o, [p.product.slug]: !o[p.product.slug] }))}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ProductFolder({ item, open, onToggle }: { item: PlanProduct; open: boolean; onToggle: () => void }) {
  const { product, qty } = item;
  const panelId = `plan-${product.slug}`;
  const facts = [
    `${formatCount(qty)} ${pluralDevices(qty)}`,
    `${formatCount(item.positions)} ${plural(item.positions, ["позиція", "позиції", "позицій"])}`,
    item.prints > 0 && `пластик ${formatGrams(item.grams)}`,
    item.prints > 0 && `друк ${formatMinutes(item.minutes)}`,
    item.cablePieces > 0 && `кабель ${formatLength(item.cableCm)}`,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-neutral-200">
      <div className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {product.name}
            {product.subtitle && <span className="ml-2 text-xs font-normal text-neutral-400">{product.subtitle}</span>}
          </p>
          <p className="mt-1 text-xs text-neutral-500 tabular-nums">{facts.join(" · ")}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm transition-colors hover:border-neutral-900"
        >
          Детальніше
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div id={panelId} className="border-t border-neutral-100 px-4 pb-6">
          <ProductSections
            parts={product.parts}
            wires={product.wires}
            materials={product.materials}
            devices={qty}
            idPrefix={`${product.slug}-`}
          />
          <Link
            href={`/products/${product.slug}`}
            className="mt-8 inline-block text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            Сторінка продукту →
          </Link>
        </div>
      )}
    </div>
  );
}
