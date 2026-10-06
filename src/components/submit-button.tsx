"use client";

import { useContext, type ReactNode } from "react";
import { PendingContext } from "./action-form";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  secondary: "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
  danger: "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950",
};

export function SubmitButton({
  children,
  variant = "primary",
  title,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  title?: string;
}) {
  const pending = useContext(PendingContext);
  return (
    <button
      type="submit"
      disabled={pending}
      title={title}
      className={`rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]}`}
    >
      {pending ? "…" : children}
    </button>
  );
}
