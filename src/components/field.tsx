import type { InputHTMLAttributes } from "react";

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900";

/** Labelled input. `hideLabel` keeps the label for screen readers only (table rows). */
export function Field({
  label,
  hideLabel,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hideLabel?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 text-xs text-slate-500 ${className ?? ""}`}>
      <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
      <input className={inputClass} {...props} />
    </label>
  );
}
