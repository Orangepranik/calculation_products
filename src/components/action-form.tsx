"use client";

import { createContext, startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionState } from "@/server/actions";

/** Pending flag for SubmitButton (useFormStatus only sees `<form action>` submissions). */
export const PendingContext = createContext(false);

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
};

/**
 * Form bound to a server action; shows its validation / DB error inline.
 * Submits manually so React doesn't auto-reset the fields — input survives a validation error.
 */
export function ActionForm({ action, children, className, resetOnSuccess, confirm }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      <PendingContext value={pending}>{children}</PendingContext>
      {state.error && (
        <p role="alert" className="col-span-full basis-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
