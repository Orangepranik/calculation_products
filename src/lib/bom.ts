export type MaterialCategory = "component" | "fastener" | "consumable" | "cut" | "packaging";

export type MaterialItem = {
  /** Название для сайта */
  name: string;
  /** Внутренний код в системе фирмы, если отличается от названия (PRODUCT22 → "Термоусадка") */
  code?: string;
  /** component — комплектующие, fastener — крепёж, consumable — расходники, cut — нарезка на отрезки, packaging — упаковка и документы */
  category: MaterialCategory;
  /** Процесс сборки ("Пакування"…). Позиции с процессом выводятся в блоке процесса, а не в разделе категории */
  process?: string;
  /** Название позиции, внутрь которой кладётся эта (антенны → "Пакетик для антен") */
  inside?: string;
  /** Изделие собственного производства — ссылка на его страницу в каталоге */
  productSlug?: string;
  /** Короткое примечание рядом с названием */
  note?: string;
  /** Своё производство (3D-деталь, своё изделие) — не закупается */
  madeInHouse?: boolean;
  /** Штук (или отрезков) на одно изделие */
  count: number;
  /** Длина отрезка, см; нет — считается поштучно */
  lengthCm?: number;
};

export type MaterialItemOrder = MaterialItem & { pieces: number; totalCm: number | null };

export type Segment = { count: number; lengthCm: number };

export type MaterialTotal = Omit<MaterialItem, "count" | "lengthCm"> & {
  /** На одно изделие */
  count: number;
  cm: number | null;
  /** Отрезки на одно изделие (для позиций с длиной) */
  segments: Segment[];
  /** На заказ */
  pieces: number;
  totalCm: number | null;
};

/** Процесс позиции; упаковка без явного процесса относится к «Пакування» */
export function processOf(m: Pick<MaterialItem, "process" | "category">): string | undefined {
  return m.process ?? (m.category === "packaging" ? "Пакування" : undefined);
}

export function calcMaterials(items: MaterialItem[], devices: number) {
  const rows: MaterialItemOrder[] = items.map((m) => ({
    ...m,
    process: processOf(m),
    pieces: m.count * devices,
    totalCm: m.lengthCm === undefined ? null : m.lengthCm * m.count * devices,
  }));

  // Одинаковые позиции (по коду, иначе по названию) из разных строк списка складываем — в пределах процесса
  const totals = new Map<string, MaterialTotal>();
  for (const r of rows) {
    const key = `${r.process ?? ""}|${r.code ?? r.name}`;
    const t = totals.get(key) ?? {
      name: r.name,
      code: r.code,
      category: r.category,
      process: r.process,
      inside: r.inside,
      productSlug: r.productSlug,
      note: r.note,
      madeInHouse: r.madeInHouse,
      count: 0,
      cm: null,
      segments: [],
      pieces: 0,
      totalCm: null,
    };
    t.count += r.count;
    t.pieces += r.pieces;
    if (r.lengthCm !== undefined) {
      t.cm = (t.cm ?? 0) + r.lengthCm * r.count;
      t.segments.push({ count: r.count, lengthCm: r.lengthCm });
    }
    if (r.totalCm !== null) t.totalCm = (t.totalCm ?? 0) + r.totalCm;
    totals.set(key, t);
  }

  return { rows, totals: [...totals.values()] };
}

/** Процессы в порядке первого появления в списке */
export function listProcesses(items: MaterialItem[]): string[] {
  return [...new Set(items.flatMap((m) => processOf(m) ?? []))];
}
