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

export type PartOrder = Part & {
  minutesPerUnit: number;
  gramsPerUnit: number | null;
  /** Сколько деталей нужно на заказ */
  needed: number;
  /** Сколько печатей (партий) нужно запустить */
  prints: number;
  /** Лишние детали с последней печати */
  surplus: number;
  /** Точный расход — только на нужные детали */
  minutes: number;
  grams: number | null;
  /** Расход по полным печатям */
  printMinutes: number;
  printGrams: number | null;
};

export type OrderCalc = {
  devices: number;
  parts: PartOrder[];
  totalMinutes: number;
  totalGrams: number;
  totalPrintMinutes: number;
  totalPrintGrams: number;
  totalPrints: number;
  /** Детали без указанного веса — в граммы не вошли */
  missingGrams: string[];
};

export function calcOrder(parts: Part[], devices: number): OrderCalc {
  const rows = parts.map((p): PartOrder => {
    const { quantity, minutes, grams } = p.batch;
    const needed = devices * p.perAssembly;
    const prints = Math.ceil(needed / quantity);
    const minutesPerUnit = minutes / quantity;
    const gramsPerUnit = grams === null ? null : grams / quantity;
    return {
      ...p,
      minutesPerUnit,
      gramsPerUnit,
      needed,
      prints,
      surplus: prints * quantity - needed,
      minutes: minutesPerUnit * needed,
      grams: gramsPerUnit === null ? null : gramsPerUnit * needed,
      printMinutes: prints * minutes,
      printGrams: grams === null ? null : prints * grams,
    };
  });
  const sum = (f: (r: PartOrder) => number | null) => rows.reduce((s, r) => s + (f(r) ?? 0), 0);
  return {
    devices,
    parts: rows,
    totalMinutes: sum((r) => r.minutes),
    totalGrams: sum((r) => r.grams),
    totalPrintMinutes: sum((r) => r.printMinutes),
    totalPrintGrams: sum((r) => r.printGrams),
    totalPrints: sum((r) => r.prints),
    missingGrams: rows.filter((r) => r.gramsPerUnit === null).map((r) => r.name),
  };
}

/** h — часы, m — минуты */
export const hm = (h: number, m = 0) => h * 60 + m;
