"use client";

import { useState } from "react";
import type { Part } from "@/lib/calc";
import type { WireCut } from "@/lib/wires";
import { PartsTable } from "./PartsTable";
import { WiresTable } from "./WiresTable";
import { MaterialsSections } from "./MaterialsSections";
import type { MaterialItem } from "@/lib/bom";

type Props = { parts?: Part[]; wires?: WireCut[]; materials?: MaterialItem[] };

export function ProductCalculator({ parts, wires, materials }: Props) {
  const [input, setInput] = useState("1");
  const parsed = Number.parseInt(input, 10);
  const devices = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

  return (
    <>
      <label className="mt-10 block w-40">
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
        <section className="mt-16">
          <h2 className="text-sm font-medium text-neutral-500">3D-друк</h2>
          <PartsTable parts={parts} devices={devices} />
        </section>
      )}
      {wires && (
        <section className="mt-16">
          <h2 className="text-sm font-medium text-neutral-500">Нарізання кабелю</h2>
          <WiresTable cuts={wires} devices={devices} />
        </section>
      )}
    </>
  );
}

export function pluralDevices(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "виріб";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "вироби";
  return "виробів";
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
