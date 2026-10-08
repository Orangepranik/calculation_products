"use client";

import { useState } from "react";
import { plural } from "@/lib/format";
import type { Part } from "@/lib/calc";
import type { WireCut } from "@/lib/wires";
import { PartsTable } from "./PartsTable";
import { WiresTable } from "./WiresTable";
import { MaterialsSections, PackagingSection } from "./MaterialsSections";
import type { MaterialItem } from "@/lib/bom";
import { countPositions } from "@/lib/positions";

type Props = { parts?: Part[]; wires?: WireCut[]; materials?: MaterialItem[] };

export function ProductCalculator({ parts, wires, materials }: Props) {
  const [input, setInput] = useState("1");
  const parsed = Number.parseInt(input, 10);
  const devices = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  const sections = countPositions({ parts, wires, materials });
  const totalPositions = sections.reduce((s, x) => s + x.count, 0);

  return (
    <>
      <div className="mt-8 rounded-lg border border-neutral-200 p-4">
        <p className="text-xs text-neutral-500">Позицій для збирання</p>
        <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{totalPositions}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {sections.map((x) => (
            <li key={x.id}>
              <a href={`#${x.id}`} className="text-neutral-500 transition-colors hover:text-neutral-900">
                {x.label} <span className="tabular-nums text-neutral-900">{x.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-8 block w-40">
        <span className="text-xs text-neutral-500">Кількість виробів</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-base tabular-nums outline-none transition-colors focus:border-neutral-900"
        />
      </label>

      {materials && <MaterialsSections items={materials} devices={devices} />}
      {parts && (
        <section id="print" className="mt-16 scroll-mt-6">
          <h2 className="text-sm font-medium text-neutral-500">3D-друк</h2>
          <PartsTable parts={parts} devices={devices} />
        </section>
      )}
      {wires && (
        <section id="wires" className="mt-16 scroll-mt-6">
          <h2 className="text-sm font-medium text-neutral-500">Нарізання кабелю</h2>
          <WiresTable cuts={wires} devices={devices} />
        </section>
      )}
      {materials && <PackagingSection items={materials} devices={devices} />}
    </>
  );
}

export function pluralDevices(n: number): string {
  return plural(n, ["виріб", "вироби", "виробів"]);
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-neutral-400 tabular-nums">{note}</p>}
    </div>
  );
}
