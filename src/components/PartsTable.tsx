import { pluralDevices, Stat } from "./ProductCalculator";
import { calcOrder, type Part } from "@/lib/calc";
import { formatCount, formatGrams, formatMinutes } from "@/lib/format";

export function PartsTable({ parts, devices }: { parts: Part[]; devices: number }) {
  const order = calcOrder(parts, devices);

  return (
    <div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Пластик"
          value={formatGrams(order.totalGrams)}
          note={`повними друками: ${formatGrams(order.totalPrintGrams)}`}
        />
        <Stat
          label="Час друку"
          value={formatMinutes(order.totalMinutes)}
          note={`повними друками: ${formatMinutes(order.totalPrintMinutes)}`}
        />
        <Stat label="Друків" value={formatCount(order.totalPrints)} note="запусків принтера" />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-3 font-normal">№</th>
              <th className="py-2 pr-3 font-normal">Деталь</th>
              <th className="py-2 pr-3 font-normal">Партія</th>
              <th className="py-2 pr-3 text-right font-normal">Потрібно</th>
              <th className="py-2 pr-3 text-right font-normal">Друків</th>
              <th className="py-2 pr-3 text-right font-normal">Пластик</th>
              <th className="py-2 text-right font-normal">Час</th>
            </tr>
          </thead>
          <tbody>
            {order.parts.map((r) => {
              const unit = r.unit ?? "шт";
              return (
                <tr key={r.no} className="border-b border-neutral-100 align-top">
                  <td className="py-3 pr-3 text-neutral-400">{r.no}</td>
                  <td className="py-3 pr-3">{r.name}</td>
                  <td className="py-3 pr-3 text-neutral-500">
                    {formatCount(r.batch.quantity)} {unit} · {formatMinutes(r.batch.minutes)} · {formatGrams(r.batch.grams)}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {formatCount(r.needed)} {unit}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {formatCount(r.prints)}
                    {r.surplus > 0 && (
                      <span className="block text-xs text-neutral-400">
                        +{formatCount(r.surplus)} {unit} зайвих
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-right">{formatGrams(r.grams)}</td>
                  <td className="py-3 text-right">{formatMinutes(r.minutes)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="py-3 pr-3" colSpan={4}>
                Разом на {formatCount(devices)} {pluralDevices(devices)}
              </td>
              <td className="py-3 pr-3 text-right">{formatCount(order.totalPrints)}</td>
              <td className="py-3 pr-3 text-right">{formatGrams(order.totalGrams)}</td>
              <td className="py-3 text-right">{formatMinutes(order.totalMinutes)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Пластик і час у таблиці — точно на потрібні деталі. «Повними друками» — з урахуванням зайвих деталей останнього
        друку.
      </p>
      {order.missingGrams.length > 0 && (
        <p className="mt-2 text-xs text-neutral-500">
          Без ваги пластику, до підсумку не ввійшли: {order.missingGrams.join(", ")}.
        </p>
      )}
    </div>
  );
}
