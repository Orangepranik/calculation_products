import { z } from "zod";

const MAX = 1_000_000_000;

/** Число из поля формы: принимает "1,5" и "1.5". */
function decimal(opts: { min?: number; gt?: number; max?: number } = {}) {
  let n = z.number({ error: "Введите число" }).refine(Number.isFinite, "Введите число");
  if (opts.gt !== undefined) n = n.refine((v) => v > opts.gt!, `Должно быть больше ${opts.gt}`);
  if (opts.min !== undefined) n = n.refine((v) => v >= opts.min!, `Должно быть не меньше ${opts.min}`);
  n = n.refine((v) => v <= (opts.max ?? MAX), "Слишком большое значение");
  return z
    .string()
    .trim()
    .min(1, "Обязательное поле")
    .transform((s) => Number(s.replace(",", ".")))
    .pipe(n);
}

const optionalDecimal = (opts: Parameters<typeof decimal>[0]) =>
  z
    .string()
    .trim()
    .transform((s) => (s === "" ? undefined : s))
    .pipe(decimal(opts).optional());

const name = z
  .string()
  .trim()
  .min(1, "Введите название")
  .max(120, "Не длиннее 120 символов")
  // Отсекаем управляющие символы.
  .refine((s) => !/[\u0000-\u001f\u007f]/.test(s), "Недопустимые символы");

const unit = z.string().trim().min(1, "Укажите единицу").max(16, "Не длиннее 16 символов");

export const id = z.coerce.number().int().positive();

export const materialInput = z.object({
  name,
  unit,
  packSize: decimal({ gt: 0 }),
  packPrice: optionalDecimal({ min: 0 }),
  stock: optionalDecimal({ min: 0 }).transform((v) => v ?? 0),
});

export const productInput = z.object({ name, unit });

export const recipeItemInput = z.object({
  materialId: id,
  qtyPerUnit: decimal({ gt: 0 }),
  wastePct: optionalDecimal({ min: 0, max: 999 }).transform((v) => v ?? 0),
});

/** Тело POST /api/calculate (JSON). */
export const calculateInput = z.object({
  lines: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().positive().max(MAX),
      }),
    )
    .min(1, "Добавьте хотя бы одну позицию")
    .max(100),
});

/** formData → plain object only for the expected keys (ignores everything else). */
export function pick<K extends string>(fd: FormData, keys: readonly K[]): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const k of keys) {
    const v = fd.get(k);
    out[k] = typeof v === "string" ? v : "";
  }
  return out;
}

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Некорректные данные";
}
