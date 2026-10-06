"use client";

import Link from "next/link";
import { useState } from "react";
import { inputClass } from "@/components/field";
import { fmt, fmtMoney } from "@/lib/format";
import type { CalculationResult, MaterialNeed } from "@/lib/types";

type ProductOption = { id: number; name: string; unit: string; hasRecipe: boolean };
type Row = { key: number; productId: string; quantity: string };

let nextKey = 1;
const newRow = (productId = ""): Row => ({ key: nextKey++, productId, quantity: "" });

export function Calculator({ products }: { products: ProductOption[] }) {
  const [rows, setRows] = useState<Row[]>(() => [newRow(products[0] ? String(products[0].id) : "")]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
        Пока нет продукции. Сначала добавьте <Link className="text-indigo-600 underline" href="/materials">материалы</Link>,
        затем <Link className="text-indigo-600 underline" href="/products">продукцию</Link> с нормами расхода.
      </div>
    );
  }

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const lines = rows
      .filter((r) => r.productId && r.quantity.trim())
      .map((r) => ({ productId: Number(r.productId), quantity: Number(r.quantity.replace(",", ".")) }));
    if (lines.length === 0) return setError("Укажите количество хотя бы для одной позиции");
    if (lines.some((l) => !Number.isFinite(l.quantity) || l.quantity <= 0))
      return setError("Количество должно быть положительным числом");

    setLoading(true);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка расчёта");
      setResult(data as CalculationResult);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Ошибка расчёта");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="no-print space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-medium">План выпуска</h2>
        {rows.map((row) => {
          const unit = products.find((p) => String(p.id) === row.productId)?.unit;
          return (
            <div key={row.key} className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-slate-500">
                Продукт
                <select className={inputClass} value={row.productId} onChange={(e) => update(row.key, { productId: e.target.value })}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.hasRecipe ? "" : " (нет рецептуры)"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex w-40 flex-col gap-1 text-xs text-slate-500">
                Количество{unit ? `, ${unit}` : ""}
                <input
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="0"
                  value={row.quantity}
                  onChange={(e) => update(row.key, { quantity: e.target.value })}
                />
              </label>
              <button
                type="button"
                aria-label="Удалить строку"
                disabled={rows.length === 1}
                onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                className="rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:invisible dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
          );
        })}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow(String(products[0]!.id))])}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            + Добавить позицию
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Считаю…" : "Рассчитать"}
          </button>
        </div>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>

      {result && <Result result={result} />}
    </div>
  );
}

function Result({ result }: { result: CalculationResult }) {
  const toBuy = result.needs.filter((n) => n.packs > 0);
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">Результат</h2>
        <button type="button" onClick={() => window.print()} className="no-print text-sm text-indigo-600 hover:underline">
          Печать
        </button>
      </div>

      <p className="text-sm text-slate-500">
        План: {result.lines.map((l) => `${l.productName} — ${fmt(l.quantity)} ${l.productUnit}`).join("; ")}
      </p>

      {result.productsWithoutRecipe.length > 0 && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Нет норм расхода для: {result.productsWithoutRecipe.join(", ")} — эти позиции не учтены.
        </p>
      )}

      {result.needs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-3 py-2">Материал</th>
                <th className="px-3 py-2 text-right">Нужно</th>
                <th className="px-3 py-2 text-right">На складе</th>
                <th className="px-3 py-2 text-right">Не хватает</th>
                <th className="px-3 py-2 text-right">Купить</th>
                <th className="px-3 py-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {result.needs.map((n) => (
                <NeedRow key={n.material.id} need={n} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold dark:border-slate-800">
                <td className="px-3 py-2" colSpan={5}>
                  Итого к оплате{result.hasUnpricedPurchases && <span className="font-normal text-amber-600"> (не у всех материалов указана цена)</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(result.totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {result.needs.length > 0 && toBuy.length === 0 && (
        <p className="text-sm text-emerald-600">Всех материалов достаточно на складе — закупка не нужна.</p>
      )}

      <Formulas />
    </section>
  );
}

function NeedRow({ need: n }: { need: MaterialNeed }) {
  const [open, setOpen] = useState(false);
  const u = n.material.unit;
  return (
    <>
      <tr className="border-t border-slate-100 dark:border-slate-800">
        <td className="px-3 py-2">
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-left hover:text-indigo-600" aria-expanded={open}>
            <span className="no-print mr-1 inline-block w-3 text-slate-400">{open ? "▾" : "▸"}</span>
            {n.material.name}
          </button>
        </td>
        <td className="px-3 py-2 text-right tabular-nums">{fmt(n.required)} {u}</td>
        <td className="px-3 py-2 text-right tabular-nums text-slate-500">{fmt(n.material.stock)} {u}</td>
        <td className="px-3 py-2 text-right tabular-nums">{n.shortage > 0 ? `${fmt(n.shortage)} ${u}` : "—"}</td>
        <td className="px-3 py-2 text-right tabular-nums font-medium">
          {n.packs > 0 ? (
            <>
              {fmt(n.packs)} уп. <span className="font-normal text-slate-500">({fmt(n.purchaseQty)} {u})</span>
            </>
          ) : (
            <span className="text-emerald-600">не нужно</span>
          )}
        </td>
        <td className="px-3 py-2 text-right tabular-nums">{n.cost === null ? (n.packs > 0 ? "?" : "—") : fmtMoney(n.cost)}</td>
      </tr>
      {open && (
        <tr className="bg-slate-50/60 dark:bg-slate-800/30">
          <td colSpan={6} className="px-3 py-3">
            <Breakdown need={n} />
          </td>
        </tr>
      )}
    </>
  );
}

/** Пошаговый расчёт по материалу с подставленными числами. */
function Breakdown({ need: n }: { need: MaterialNeed }) {
  const u = n.material.unit;
  const m = n.material;
  return (
    <div className="space-y-1 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">
      <p className="font-sans font-medium">1. Потребность = Σ количество × норма × (1 + потери %)</p>
      {n.contributions.map((c) => (
        <p key={c.productId} className="pl-4">
          {c.productName}: {fmt(c.quantity)} {c.productUnit} × {fmt(c.qtyPerUnit)} {u} × (1 + {fmt(c.wastePct)}%) ={" "}
          <b>{fmt(c.amount)} {u}</b>
        </p>
      ))}
      {n.contributions.length > 1 && (
        <p className="pl-4">
          Итого: {n.contributions.map((c) => fmt(c.amount)).join(" + ")} = <b>{fmt(n.required)} {u}</b>
        </p>
      )}
      <p className="pt-1 font-sans font-medium">2. Не хватает = max(0, потребность − остаток)</p>
      <p className="pl-4">
        max(0, {fmt(n.required)} − {fmt(m.stock)}) = <b>{fmt(n.shortage)} {u}</b>
      </p>
      <p className="pt-1 font-sans font-medium">3. Упаковок = ⌈не хватает ÷ размер упаковки⌉</p>
      <p className="pl-4">
        ⌈{fmt(n.shortage)} ÷ {fmt(m.packSize)}⌉ = <b>{fmt(n.packs)} уп.</b> → {fmt(n.packs)} × {fmt(m.packSize)} ={" "}
        <b>{fmt(n.purchaseQty)} {u}</b>
        {n.surplus > 0 && <> (излишек {fmt(n.surplus)} {u} останется на складе)</>}
      </p>
      <p className="pt-1 font-sans font-medium">4. Сумма = упаковок × цена упаковки</p>
      <p className="pl-4">
        {m.packPrice === null ? "цена не указана" : <>{fmt(n.packs)} × {fmtMoney(m.packPrice)} = <b>{fmtMoney(n.cost ?? 0)}</b></>}
      </p>
    </div>
  );
}

function Formulas() {
  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
      <summary className="cursor-pointer font-medium">Как считается</summary>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-600 dark:text-slate-300">
        <li>
          <b>Потребность</b> по каждому материалу = Σ по продуктам (количество × норма расхода на 1 ед. × (1 + % потерь / 100)).
        </li>
        <li>
          <b>Не хватает</b> = max(0, потребность − остаток на складе).
        </li>
        <li>
          <b>Упаковок к закупке</b> = ⌈не хватает ÷ размер упаковки⌉ (округление вверх), объём закупки = упаковок × размер.
        </li>
        <li>
          <b>Сумма</b> = упаковок × цена упаковки.
        </li>
      </ol>
      <p className="mt-2 text-xs text-slate-500">Нажмите на название материала в таблице, чтобы увидеть расчёт с подставленными числами.</p>
    </details>
  );
}
