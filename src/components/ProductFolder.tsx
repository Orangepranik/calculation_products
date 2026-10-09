"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { summarize, type PlanProduct } from "@/lib/plan";
import { subassembliesOf } from "@/lib/assembly";
import { formatCount, formatGrams, formatLength, formatMinutes, plural } from "@/lib/format";
import { ProductSections, pluralDevices } from "./ProductCalculator";

/** Папка продукта: краткая сводка + «Детальніше» с полным расчётом и вложенными изделиями */
export function ProductFolder({
  item,
  catalog,
  idPrefix = "",
}: {
  item: PlanProduct;
  catalog: Product[];
  idPrefix?: string;
}) {
  const [open, setOpen] = useState(false);
  const { product, qty } = item;
  const prefix = `${idPrefix}${product.slug}-`;
  const facts = [
    `${formatCount(qty)} ${pluralDevices(qty)}`,
    `${formatCount(item.positions)} ${plural(item.positions, ["позиція", "позиції", "позицій"])}`,
    ...item.subs.map((s) => `+ ${s.product.name} × ${formatCount(s.qty)}`),
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
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`${prefix}panel`}
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
        <div id={`${prefix}panel`} className="border-t border-neutral-100 px-4 pb-6">
          <ProductSections
            parts={product.parts}
            wires={product.wires}
            materials={product.materials}
            devices={qty}
            idPrefix={prefix}
          />
          <Subassemblies product={product} devices={qty} catalog={catalog} idPrefix={prefix} />
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

/** Изделия своего производства внутри продукта — каждое своей папкой на нужное количество */
export function Subassemblies({
  product,
  devices,
  catalog,
  idPrefix = "",
}: {
  product: Product;
  devices: number;
  catalog: Product[];
  idPrefix?: string;
}) {
  const subs = subassembliesOf(product, catalog);
  if (subs.length === 0) return null;
  return (
    <section id={`${idPrefix}own-production`} className="mt-16 scroll-mt-6">
      <h2 className="text-sm font-medium text-neutral-500">Власне виробництво</h2>
      <p className="mt-1 text-xs text-neutral-400">
        Входить до складу — матеріали й друк на ці вироби теж потрібні.
      </p>
      <div className="mt-4 space-y-3">
        {subs.map((s) => (
          <ProductFolder
            key={s.product.slug}
            item={summarize({ product: s.product, qty: devices * s.count }, catalog)}
            catalog={catalog}
            idPrefix={idPrefix}
          />
        ))}
      </div>
    </section>
  );
}
