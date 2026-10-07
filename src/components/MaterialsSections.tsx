import type { ReactNode } from "react";
import { pluralDevices, Stat } from "./ProductCalculator";
import { calcMaterials, type MaterialItem, type MaterialTotal } from "@/lib/bom";
import { formatCount, formatLength } from "@/lib/format";

/** Три раздела: комплектующие, крепёж (одинаковые позиции сложены), нарезка лент на отрезки */
export function MaterialsSections({ items, devices }: { items: MaterialItem[]; devices: number }) {
  const { rows, totals } = calcMaterials(items, devices);
  const components = totals.filter((t) => t.category === "component");
  const fasteners = totals.filter((t) => t.category === "fastener");
  const cutTotals = totals.filter((t) => t.category === "cut");
  const cuts = rows.filter((r) => r.category === "cut");
  const forDevices = `На ${formatCount(devices)} ${pluralDevices(devices)}`;

  return (
    <>
      {components.length > 0 && (
        <Section title="Комплектуючі" first>
          <PiecesTable rows={components} forDevices={forDevices} withTotal />
        </Section>
      )}

      {fasteners.length > 0 && (
        <Section title="Кріплення">
          <PiecesTable rows={fasteners} forDevices={forDevices} />
        </Section>
      )}

      {cuts.length > 0 && (
        <Section title="Нарізання стрічок">
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {cutTotals.map((t) => (
              <Stat
                key={t.name}
                label={t.name}
                value={formatLength(t.totalCm ?? 0)}
                note={`${formatCount(t.pieces)} відрізків`}
              />
            ))}
          </div>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                  <th className="py-2 pr-3 font-normal">Матеріал</th>
                  <th className="py-2 pr-3 text-right font-normal">Відрізок</th>
                  <th className="py-2 pr-3 text-right font-normal">На виріб</th>
                  <th className="py-2 text-right font-normal">{forDevices}</th>
                </tr>
              </thead>
              <tbody>
                {cuts.map((r, i) => (
                  <tr key={i} className="border-b border-neutral-100 align-top">
                    <td className="py-3 pr-3">{r.name}</td>
                    <td className="py-3 pr-3 text-right">{formatLength(r.lengthCm ?? 0)}</td>
                    <td className="py-3 pr-3 text-right">{formatCount(r.count)} шт</td>
                    <td className="py-3 text-right">
                      {formatCount(r.pieces)} шт
                      <span className="block text-xs text-neutral-400">{formatLength(r.totalCm ?? 0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </>
  );
}

function Section({ title, first, children }: { title: string; first?: boolean; children: ReactNode }) {
  return (
    <section className={first ? "mt-12" : "mt-16"}>
      <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
      {children}
    </section>
  );
}

function PiecesTable({ rows, forDevices, withTotal }: { rows: MaterialTotal[]; forDevices: string; withTotal?: boolean }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[400px] text-sm tabular-nums">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <th className="py-2 pr-3 font-normal">Позиція</th>
            <th className="py-2 pr-3 text-right font-normal">На виріб</th>
            <th className="py-2 text-right font-normal">{forDevices}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-neutral-100">
              <td className="py-3 pr-3">{r.name}</td>
              <td className="py-3 pr-3 text-right">{formatCount(r.count)} шт</td>
              <td className="py-3 text-right">{formatCount(r.pieces)} шт</td>
            </tr>
          ))}
        </tbody>
        {withTotal && (
          <tfoot>
            <tr className="font-medium">
              <td className="py-3 pr-3">Разом</td>
              <td className="py-3 pr-3 text-right">{formatCount(rows.reduce((s, r) => s + r.count, 0))} шт</td>
              <td className="py-3 text-right">{formatCount(rows.reduce((s, r) => s + r.pieces, 0))} шт</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
