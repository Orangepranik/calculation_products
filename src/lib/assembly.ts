import type { Product } from "@/data/products";

export type Subassembly = { product: Product; count: number };

export const hasCalculation = (p: Product) => Boolean(p.parts || p.wires || p.materials);

/**
 * Изделия своего производства, которые входят в продукт (Антена 5G в КОЖАН 4.0):
 * позиции списка материалов с madeInHouse + productSlug, у которых в каталоге есть расчёт.
 */
export function subassembliesOf(product: Product, catalog: Product[]): Subassembly[] {
  const counts = new Map<string, number>();
  for (const m of product.materials ?? []) {
    if (m.madeInHouse && m.productSlug && m.productSlug !== product.slug) {
      counts.set(m.productSlug, (counts.get(m.productSlug) ?? 0) + m.count);
    }
  }
  return [...counts].flatMap(([slug, count]) => {
    const sub = catalog.find((p) => p.slug === slug);
    return sub && hasCalculation(sub) ? [{ product: sub, count }] : [];
  });
}

/** Продукт и все вложенные изделия с количествами (рекурсивно, с защитой от циклов) */
export function expand(
  product: Product,
  qty: number,
  catalog: Product[],
  seen: string[] = [],
): { product: Product; qty: number }[] {
  if (seen.includes(product.slug)) return [];
  return [
    { product, qty },
    ...subassembliesOf(product, catalog).flatMap((s) =>
      expand(s.product, qty * s.count, catalog, [...seen, product.slug]),
    ),
  ];
}
