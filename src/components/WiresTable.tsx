import { pluralDevices, Stat } from "./ProductCalculator";
import { Length } from "./MaterialsSections";
import { calcWires, type WireColor, type WireCut } from "@/lib/wires";
import { formatCount, formatLength, plural } from "@/lib/format";

const segmentsWord = (n: number) => `${formatCount(n)} ${plural(n, ["відрізок", "відрізки", "відрізків"])}`;

const swatch: Record<WireColor, string> = {
  червоний: "bg-red-600",
  білий: "bg-white",
  чорний: "bg-neutral-900",
  жовтий: "bg-yellow-400",
};

export function WiresTable({ cuts, devices }: { cuts: WireCut[]; devices: number }) {
  const { cuts: rows, totals, totalPieces } = calcWires(cuts, devices);
  const totalCm = totals.reduce((s, t) => s + t.totalCm, 0);

  return (
    <div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Кабель" value={formatLength(totalCm)} note={segmentsWord(totalPieces)} />
      </div>

      <h3 className="mt-8 text-xs text-neutral-500">Потрібно кабелю</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-3 font-normal">Провід</th>
              <th className="py-2 pr-3 font-normal">Колір</th>
              <th className="py-2 text-right font-normal">Довжина</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((t) => (
              <tr key={`${t.gauge}|${t.color}`} className="border-b border-neutral-100 align-top">
                <td className="py-3 pr-3">{t.gauge}</td>
                <td className="py-3 pr-3">
                  <Color color={t.color} />
                </td>
                <td className="py-3 text-right">
                  <Length cm={t.totalCm} detail={segmentsWord(t.pieces)} />
                  {t.replaceableCm > 0 && (
                    <span className="block text-xs text-neutral-400">
                      з них {formatLength(t.replaceableCm)} можна замінити
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="py-3 pr-3" colSpan={2}>
                Разом на {formatCount(devices)} {pluralDevices(devices)}
              </td>
              <td className="py-3 text-right">
                <Length cm={totalCm} detail={segmentsWord(totalPieces)} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3 className="mt-10 text-xs text-neutral-500">Нарізка по вузлах</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-3 font-normal">Вузол</th>
              <th className="py-2 pr-3 font-normal">Провід</th>
              <th className="py-2 pr-3 font-normal">Колір</th>
              <th className="py-2 pr-3 text-right font-normal">На виріб</th>
              <th className="py-2 text-right font-normal">Всього</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const firstInGroup = i === 0 || rows[i - 1].group !== r.group;
              return (
                <tr
                  key={i}
                  className={firstInGroup && i > 0 ? "border-t border-neutral-200" : "border-t border-neutral-100"}
                >
                  <td className="py-3 pr-3 text-neutral-500">{firstInGroup ? r.group : ""}</td>
                  <td className="py-3 pr-3">{r.gauge}</td>
                  <td className="py-3 pr-3">
                    <Color color={r.colors[0]} alternatives={r.colors.slice(1)} />
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <Length cm={r.lengthCm * r.count} detail={`${formatCount(r.count)} × ${formatLength(r.lengthCm)}`} />
                  </td>
                  <td className="py-3 text-right">
                    <Length cm={r.totalCm} detail={`${formatCount(r.pieces)} × ${formatLength(r.lengthCm)}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Color({ color, alternatives = [] }: { color: WireColor; alternatives?: WireColor[] }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2.5 shrink-0 rounded-full outline outline-1 -outline-offset-1 outline-black/15 ${swatch[color]}`} />
      {color}
      {alternatives.length > 0 && <span className="text-neutral-400">або {alternatives.join(", ")}</span>}
    </span>
  );
}
