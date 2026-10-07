import { calcAssembly, type Part } from "@/lib/calc";
import { formatGrams, formatMinutes } from "@/lib/format";

export function PartsTable({ parts }: { parts: Part[] }) {
  const { parts: rows, totalMinutes, totalGrams, missingGrams } = calcAssembly(parts);

  return (
    <div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
        <Stat label="Печать на 1 изделие" value={formatMinutes(totalMinutes)} />
        <Stat label="Пластик на 1 изделие" value={formatGrams(totalGrams)} />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-3 font-normal">№</th>
              <th className="py-2 pr-3 font-normal">Деталь</th>
              <th className="py-2 pr-3 font-normal">Партия</th>
              <th className="py-2 pr-3 text-right font-normal">Время / шт</th>
              <th className="py-2 text-right font-normal">Пластик / шт</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.no} className="border-b border-neutral-100">
                <td className="py-3 pr-3 text-neutral-400">{r.no}</td>
                <td className="py-3 pr-3">{r.name}</td>
                <td className="py-3 pr-3 text-neutral-500">
                  {r.batch.quantity} {r.unit ?? "шт"} · {formatMinutes(r.batch.minutes)} · {formatGrams(r.batch.grams)}
                </td>
                <td className="py-3 pr-3 text-right">{formatMinutes(r.minutesPerUnit)}</td>
                <td className="py-3 text-right">{formatGrams(r.gramsPerUnit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="py-3 pr-3" colSpan={3}>Итого на изделие</td>
              <td className="py-3 pr-3 text-right">{formatMinutes(totalMinutes)}</td>
              <td className="py-3 text-right">{formatGrams(totalGrams)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {missingGrams.length > 0 && (
        <p className="mt-4 text-xs text-neutral-500">Без веса пластика, в итог не вошли: {missingGrams.join(", ")}.</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
