export type PrintBatch = {
  /** Сколько деталей выходит за одну печать */
  quantity: number;
  /** Время печати партии, минуты */
  minutes: number;
  /** Расход пластика на партию, граммы; null — не указан */
  grams: number | null;
};

export type Part = {
  no: number;
  name: string;
  /** Единица, в которой считается партия ("шт", "пар") */
  unit?: string;
  batch: PrintBatch;
  /** Сколько штук этой детали идёт на одно изделие */
  perAssembly: number;
};

export type PartCalc = Part & { minutesPerUnit: number; gramsPerUnit: number | null };

export type AssemblyCalc = {
  parts: PartCalc[];
  totalMinutes: number;
  totalGrams: number;
  /** Детали без указанного веса — в totalGrams не вошли */
  missingGrams: string[];
};

export function calcAssembly(parts: Part[]): AssemblyCalc {
  const rows = parts.map((p) => ({
    ...p,
    minutesPerUnit: p.batch.minutes / p.batch.quantity,
    gramsPerUnit: p.batch.grams === null ? null : p.batch.grams / p.batch.quantity,
  }));
  return {
    parts: rows,
    totalMinutes: rows.reduce((s, r) => s + r.minutesPerUnit * r.perAssembly, 0),
    totalGrams: rows.reduce((s, r) => s + (r.gramsPerUnit ?? 0) * r.perAssembly, 0),
    missingGrams: rows.filter((r) => r.gramsPerUnit === null).map((r) => r.name),
  };
}

/** h — часы, m — минуты */
export const hm = (h: number, m = 0) => h * 60 + m;
