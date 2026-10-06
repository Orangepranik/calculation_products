import type {
  CalculationResult,
  Contribution,
  Material,
  MaterialNeed,
  OrderLine,
  ProductWithRecipe,
} from "./types";

/** Округление до N знаков, гасит артефакты float (0.1 + 0.2). */
export function round(value: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/**
 * Потребность материала на позицию:
 *   amount = quantity × qtyPerUnit × (1 + wastePct / 100)
 */
export function lineAmount(quantity: number, qtyPerUnit: number, wastePct: number): number {
  return round(quantity * qtyPerUnit * (1 + wastePct / 100));
}

/**
 * Сколько упаковок купить:
 *   packs = ceil(shortage / packSize)
 * Деление округляется до 6 знаков перед ceil, чтобы 3.0000000001 не превратилось в 4.
 */
export function packsToBuy(shortage: number, packSize: number): number {
  if (shortage <= 0) return 0;
  return Math.ceil(round(shortage / packSize, 6));
}

export function calculate(
  order: OrderLine[],
  products: ProductWithRecipe[],
  materials: Material[],
): CalculationResult {
  const productById = new Map(products.map((p) => [p.id, p]));
  const materialById = new Map(materials.map((m) => [m.id, m]));

  // Одинаковые продукты в заказе складываем.
  const merged = new Map<number, number>();
  for (const { productId, quantity } of order) {
    if (!productById.has(productId)) throw new Error(`Unknown product ${productId}`);
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const contributions = new Map<number, Contribution[]>();
  const productsWithoutRecipe: string[] = [];
  const lines: CalculationResult["lines"] = [];

  for (const [productId, quantity] of merged) {
    const product = productById.get(productId)!;
    lines.push({ productId, productName: product.name, productUnit: product.unit, quantity });
    if (product.recipe.length === 0) productsWithoutRecipe.push(product.name);

    for (const item of product.recipe) {
      if (!materialById.has(item.materialId)) throw new Error(`Unknown material ${item.materialId}`);
      const list = contributions.get(item.materialId) ?? [];
      list.push({
        productId,
        productName: product.name,
        productUnit: product.unit,
        quantity,
        qtyPerUnit: item.qtyPerUnit,
        wastePct: item.wastePct,
        amount: lineAmount(quantity, item.qtyPerUnit, item.wastePct),
      });
      contributions.set(item.materialId, list);
    }
  }

  const needs: MaterialNeed[] = [];
  for (const [materialId, list] of contributions) {
    const material = materialById.get(materialId)!;
    const required = round(list.reduce((s, c) => s + c.amount, 0));
    const shortage = round(Math.max(0, required - material.stock));
    const packs = packsToBuy(shortage, material.packSize);
    const purchaseQty = round(packs * material.packSize);
    needs.push({
      material,
      contributions: list,
      required,
      shortage,
      packs,
      purchaseQty,
      surplus: round(purchaseQty - shortage),
      cost: material.packPrice === null ? null : round(packs * material.packPrice, 2),
    });
  }

  needs.sort((a, b) => a.material.name.localeCompare(b.material.name, "ru"));

  return {
    lines,
    needs,
    totalCost: round(needs.reduce((s, n) => s + (n.cost ?? 0), 0), 2),
    hasUnpricedPurchases: needs.some((n) => n.packs > 0 && n.cost === null),
    productsWithoutRecipe,
  };
}
