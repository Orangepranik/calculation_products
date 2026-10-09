"use client";

import { useEffect, useState } from "react";
import { describePrinter, getPrinterModel, printerModels } from "@/data/printers";
import { schedulePrints, type PrintJob, type ShiftSettings } from "@/lib/schedule";
import { formatCount, formatDuration, formatMinutes, plural } from "@/lib/format";
import { Stat } from "./ProductCalculator";

type FleetItem = { modelId: string; count: number };
type Saved = { fleet: FleetItem[]; settings: ShiftSettings };

const STORAGE_KEY = "plan-printers-v1";
const defaults: Saved = { fleet: [], settings: { shiftHours: 12, shiftsPerDay: 1, overnight: true } };

function load(): Saved {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Saved;
    return {
      fleet: saved.fleet.filter((f) => getPrinterModel(f.modelId)),
      settings: { ...defaults.settings, ...saved.settings },
    };
  } catch {
    return defaults;
  }
}

const inputClass =
  "rounded-lg border border-neutral-200 px-3 py-1.5 text-base tabular-nums outline-none transition-colors focus:border-neutral-900";

export function PrintersPanel({ jobs }: { jobs: PrintJob[] }) {
  // Панель появляется только после ввода количества, т. е. уже в браузере — localStorage доступен сразу
  const [state, setState] = useState<Saved>(load);
  const [newModel, setNewModel] = useState(printerModels[3].id);

  // Парк принтеров и смена запоминаются в браузере
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const { fleet, settings } = state;
  const setFleet = (f: (fleet: FleetItem[]) => FleetItem[]) => setState((s) => ({ ...s, fleet: f(s.fleet) }));
  const setSettings = (patch: Partial<ShiftSettings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const printers = fleet.flatMap((f) => {
    const name = getPrinterModel(f.modelId)!.name.replace("Bambu Lab ", "");
    return Array.from({ length: f.count }, (_, i) => (f.count > 1 ? `${name} №${i + 1}` : name));
  });
  const schedule = schedulePrints(jobs, printers, settings);
  const shiftLabel = `${formatCount(settings.shiftHours)} год`;

  return (
    <section className="mt-14">
      <h2 className="text-sm font-medium text-neutral-500">Принтери та зміни</h2>

      <ul className="mt-4 divide-y divide-neutral-100 border-y border-neutral-100">
        {fleet.map((f) => {
          const model = getPrinterModel(f.modelId)!;
          return (
            <li key={f.modelId} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm">{model.name}</p>
                <p className="mt-0.5 text-xs text-neutral-400">{describePrinter(model)}</p>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                aria-label={`Кількість ${model.name}`}
                value={f.count}
                onChange={(e) => {
                  const n = Math.max(1, Number.parseInt(e.target.value, 10) || 1);
                  setFleet((fl) => fl.map((x) => (x.modelId === f.modelId ? { ...x, count: n } : x)));
                }}
                className={`w-20 text-right ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setFleet((fl) => fl.filter((x) => x.modelId !== f.modelId))}
                className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
              >
                Прибрати
              </button>
            </li>
          );
        })}
        <li className="flex flex-wrap items-center gap-3 py-3">
          <select
            aria-label="Модель принтера"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            className={`min-w-0 flex-1 bg-white ${inputClass}`}
          >
            {printerModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {describePrinter(m)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              setFleet((fl) =>
                fl.some((x) => x.modelId === newModel)
                  ? fl.map((x) => (x.modelId === newModel ? { ...x, count: x.count + 1 } : x))
                  : [...fl, { modelId: newModel, count: 1 }],
              )
            }
            className="rounded-lg border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700"
          >
            Додати принтер
          </button>
        </li>
      </ul>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 text-sm">
        <label className="block">
          <span className="text-xs text-neutral-500">Зміна, год</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={24}
            value={settings.shiftHours}
            onChange={(e) => setSettings({ shiftHours: Math.min(24, Math.max(1, Number.parseInt(e.target.value, 10) || 1)) })}
            className={`mt-1 block w-24 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-xs text-neutral-500">Змін на добу</span>
          <select
            value={settings.shiftsPerDay}
            onChange={(e) => setSettings({ shiftsPerDay: Number(e.target.value) })}
            className={`mt-1 block w-24 bg-white ${inputClass}`}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            checked={settings.overnight}
            onChange={(e) => setSettings({ overnight: e.target.checked })}
            className="size-4 accent-neutral-900"
          />
          Друк може закінчуватися після зміни
        </label>
      </div>

      {printers.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-400">Додайте принтери, щоб розрахувати, за скільки змін буде готовий друк.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Друк буде готовий через"
              value={formatDuration(schedule.finish)}
              note="від початку першої зміни"
            />
            <Stat
              label="Змін"
              value={formatCount(schedule.shiftsUsed)}
              note={`по ${shiftLabel}, ${settings.shiftsPerDay} на добу`}
            />
            <Stat
              label="Принтерів"
              value={formatCount(printers.length)}
              note={`${formatCount(jobs.length)} ${plural(jobs.length, ["друк", "друки", "друків"])}`}
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                  <th className="py-2 pr-3 font-normal">Принтер</th>
                  <th className="py-2 pr-3 text-right font-normal">Друків</th>
                  <th className="py-2 pr-3 text-right font-normal">Робота</th>
                  <th className="py-2 text-right font-normal">Завантаження</th>
                </tr>
              </thead>
              <tbody>
                {schedule.printers.map((p) => (
                  <tr key={p.printer} className="border-b border-neutral-100">
                    <td className="py-3 pr-3">{p.printer}</td>
                    <td className="py-3 pr-3 text-right">{formatCount(p.jobs.length)}</td>
                    <td className="py-3 pr-3 text-right">{formatMinutes(p.busyMinutes)}</td>
                    <td className="py-3 text-right">
                      {schedule.finish ? Math.round((p.busyMinutes / schedule.finish) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            Нові друки запускаються лише під час зміни. Час друку — заміряний на ваших принтерах, за моделлю не
            перераховується. Завантаження — частка часу роботи від загального терміну.
          </p>
        </>
      )}
    </section>
  );
}
