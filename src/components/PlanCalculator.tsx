"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import type { MaterialCategory } from "@/lib/bom";
import { calcPlan, type Contribution, type PlanMaterial } from "@/lib/plan";
import { formatCount, formatGrams, formatLength, formatMinutes, formatSegments, plural } from "@/lib/format";
import { Stat } from "./ProductCalculator";
import { Length } from "./MaterialsSections";
import { Color } from "./WiresTable";

const categories: { category: MaterialCategory; title: string }[] = [
  { category: "component", title: "Комплектуючі" },
  { category: "fastener", title: "Кріплення" },
  { category: "consumable", title: "Витратні матеріали" },
  { category: "cut", title: "Нарізання на відрізки" },
  { category: "packaging", title: "Пакування" },
];

const segmentsWord = (n: number) => `${formatCount(n)} ${plural(n, ["відрізок", "відрізки", "відрізків"])}`;

export function PlanCalculator({ products }: { products: Product[] }) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const plan = calcPlan(
    products.map((product) => {
      const n = Number.parseInt(qty[product.slug] ?? "", 10);
      return { product, qty: Number.isFinite(n) && n > 0 ? n : 0 };
    }),
  );
  const cableCm = plan.wires.reduce((s, w) => s + w.totalCm, 0);
  const cablePieces = plan.wires.reduce((s, w) => s + w.pieces, 0);

  return (
    <>
      <ul className="mt-8 divide-y divide-neutral-100 border-y border-neutral-100">
        {products.map((p) => (
          <li key={p.slug} className="flex items-center justify-between gap-4 py-3">
            <label htmlFor={`qty-${p.slug}`} className="text-sm">
              {p.name}
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

      {plan.lines.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-400">Вкажіть кількість хоча б для одного виробу.</p>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Виробів"
              value={formatCount(plan.devices)}
              note={plan.lines.map((l) => `${l.product.name} — ${formatCount(l.qty)}`).join(" · ")}
            />
            {plan.print.rows.length > 0 && (
              <>
                <Stat
                  label="Пластик"
                  value={formatGrams(plan.print.grams)}
                  note={`повними друками: ${formatGrams(plan.print.printGrams)}`}
                />
                <Stat
                  label="Час друку"
                  value={formatMinutes(plan.print.minutes)}
                  note={`повними друками: ${formatMinutes(plan.print.printMinutes)}`}
                />
              </>
            )}
            {plan.wires.length > 0 && <Stat label="Кабель" value={formatLength(cableCm)} note={segmentsWord(cablePieces)} />}
          </div>

          {categories.map(({ category, title }) => {
            const rows = plan.materials.filter((m) => m.category === category);
            return rows.length > 0 && <MaterialsBlock key={category} title={title} rows={rows} />;
          })}

          {plan.print.rows.length > 0 && (
            <Block title="3D-друк">
              <table className="w-full min-w-[640px] text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                    <th className="py-2 pr-3 font-normal">Деталь</th>
                    <th className="py-2 pr-3 text-right font-normal">Потрібно</th>
                    <th className="py-2 pr-3 text-right font-normal">Друків</th>
                    <th className="py-2 pr-3 text-right font-normal">Пластик</th>
                    <th className="py-2 text-right font-normal">Час</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.print.rows.map((r) => (
                    <tr key={`${r.product}|${r.no}`} className="border-b border-neutral-100 align-top">
                      <td className="py-3 pr-3">
                        {r.name}
                        <span className="ml-2 text-xs text-neutral-400">{r.product}</span>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        {formatCount(r.needed)} {r.unit ?? "шт"}
                      </td>
                      <td className="py-3 pr-3 text-right">{formatCount(r.prints)}</td>
                      <td className="py-3 pr-3 text-right">{formatGrams(r.grams)}</td>
                      <td className="py-3 text-right">{formatMinutes(r.minutes)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-3 pr-3" colSpan={2}>
                      Разом
                    </td>
                    <td className="py-3 pr-3 text-right">{formatCount(plan.print.prints)}</td>
                    <td className="py-3 pr-3 text-right">{formatGrams(plan.print.grams)}</td>
                    <td className="py-3 text-right">{formatMinutes(plan.print.minutes)}</td>
                  </tr>
                </tfoot>
              </table>
            </Block>
          )}

          {plan.wires.length > 0 && (
            <Block title="Кабель">
              <table className="w-full min-w-[480px] text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                    <th className="py-2 pr-3 font-normal">Провід</th>
                    <th className="py-2 pr-3 font-normal">Колір</th>
                    <th className="py-2 text-right font-normal">Довжина</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.wires.map((w) => (
                    <tr key={`${w.gauge}|${w.color}`} className="border-b border-neutral-100 align-top">
                      <td className="py-3 pr-3">
                        {w.gauge}
                        <By by={w.by} />
                      </td>
                      <td className="py-3 pr-3">
                        <Color color={w.color} />
                      </td>
                      <td className="py-3 text-right">
                        <Length cm={w.totalCm} detail={segmentsWord(w.pieces)} />
                        {w.replaceableCm > 0 && (
                          <span className="block text-xs text-neutral-400">
                            з них {formatLength(w.replaceableCm)} можна замінити
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-3 pr-3" colSpan={2}>
                      Разом
                    </td>
                    <td className="py-3 text-right">
                      <Length cm={cableCm} detail={segmentsWord(cablePieces)} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Block>
          )}

          {plan.madeInHouse.length > 0 && (
            <MaterialsBlock
              title="Власне виробництво"
              note="Входить до інших виробів — не закуповується, а виготовляється."
              rows={plan.madeInHouse}
            />
          )}
        </>
      )}
    </>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
      {note && <p className="mt-1 text-xs text-neutral-400">{note}</p>}
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

function MaterialsBlock({ title, note, rows }: { title: string; note?: string; rows: PlanMaterial[] }) {
  return (
    <Block title={title} note={note}>
      <table className="w-full min-w-[480px] text-sm tabular-nums">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <th className="py-2 pr-3 font-normal">Позиція</th>
            <th className="py-2 text-right font-normal">Потрібно</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.key} className="border-b border-neutral-100 align-top">
              <td className="py-3 pr-3">
                {m.productSlug ? (
                  <Link
                    href={`/products/${m.productSlug}`}
                    className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
                  >
                    {m.name}
                  </Link>
                ) : (
                  m.name
                )}
                {m.code && <span className="ml-2 text-xs text-neutral-400">{m.code}</span>}
                {m.scopeProduct && <span className="ml-2 text-xs text-neutral-400">{m.scopeProduct}</span>}
                <By by={m.by} />
              </td>
              <td className="py-3 text-right">
                {m.totalCm === null ? (
                  `${formatCount(m.pieces)} шт`
                ) : (
                  <Length cm={m.totalCm} detail={formatSegments(m.segments)} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Block>
  );
}

/** Разбивка по продуктам — только если позиция нужна нескольким */
function By({ by }: { by: Contribution[] }) {
  if (by.length < 2) return null;
  return (
    <span className="mt-0.5 block text-xs text-neutral-400">
      {by
        .map((b) => `${b.product} — ${b.totalCm === null ? `${formatCount(b.pieces)} шт` : formatLength(b.totalCm)}`)
        .join(" · ")}
    </span>
  );
}
