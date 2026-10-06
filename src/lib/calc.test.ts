import { describe, expect, it } from "vitest";
import { calculate, lineAmount, packsToBuy } from "./calc";
import type { Material, ProductWithRecipe } from "./types";

const flour: Material = { id: 1, name: "Мука", unit: "кг", packSize: 25, packPrice: 500, stock: 10 };
const sugar: Material = { id: 2, name: "Сахар", unit: "кг", packSize: 50, packPrice: null, stock: 0 };
const eggs: Material = { id: 3, name: "Яйца", unit: "шт", packSize: 30, packPrice: 300, stock: 100 };

const bread: ProductWithRecipe = {
  id: 1,
  name: "Хлеб",
  unit: "шт",
  recipe: [{ id: 1, materialId: 1, qtyPerUnit: 0.5, wastePct: 2 }],
};
const cake: ProductWithRecipe = {
  id: 2,
  name: "Торт",
  unit: "шт",
  recipe: [
    { id: 2, materialId: 1, qtyPerUnit: 0.3, wastePct: 0 },
    { id: 3, materialId: 2, qtyPerUnit: 0.2, wastePct: 5 },
    { id: 4, materialId: 3, qtyPerUnit: 4, wastePct: 0 },
  ],
};
const empty: ProductWithRecipe = { id: 3, name: "Пусто", unit: "шт", recipe: [] };

describe("lineAmount", () => {
  it("applies waste percent", () => {
    expect(lineAmount(100, 0.5, 2)).toBe(51);
  });
  it("is float-safe", () => {
    expect(lineAmount(3, 0.1, 0)).toBe(0.3);
  });
});

describe("packsToBuy", () => {
  it("rounds up to whole packs", () => {
    expect(packsToBuy(26, 25)).toBe(2);
    expect(packsToBuy(25, 25)).toBe(1);
  });
  it("returns 0 when nothing is missing", () => {
    expect(packsToBuy(0, 25)).toBe(0);
  });
  it("does not overshoot on float noise", () => {
    expect(packsToBuy(0.1 + 0.2, 0.1)).toBe(3);
  });
});

describe("calculate", () => {
  const products = [bread, cake, empty];
  const materials = [flour, sugar, eggs];

  it("aggregates materials across products and subtracts stock", () => {
    const r = calculate(
      [
        { productId: 1, quantity: 100 },
        { productId: 2, quantity: 10 },
      ],
      products,
      materials,
    );
    const byName = Object.fromEntries(r.needs.map((n) => [n.material.name, n]));

    // Мука: 100×0.5×1.02 + 10×0.3 = 51 + 3 = 54; не хватает 54−10 = 44 → 2 мешка по 25
    expect(byName["Мука"]).toMatchObject({ required: 54, shortage: 44, packs: 2, purchaseQty: 50, surplus: 6, cost: 1000 });
    // Сахар: 10×0.2×1.05 = 2.1 → 1 мешок, без цены
    expect(byName["Сахар"]).toMatchObject({ required: 2.1, packs: 1, cost: null });
    // Яйца: 40 шт, на складе 100 → покупать не нужно
    expect(byName["Яйца"]).toMatchObject({ required: 40, shortage: 0, packs: 0, cost: 0 });

    expect(r.totalCost).toBe(1000);
    expect(r.hasUnpricedPurchases).toBe(true);
  });

  it("merges duplicate order lines", () => {
    const r = calculate(
      [
        { productId: 1, quantity: 50 },
        { productId: 1, quantity: 50 },
      ],
      products,
      materials,
    );
    expect(r.lines).toHaveLength(1);
    expect(r.needs[0]!.required).toBe(51);
  });

  it("reports products without recipe", () => {
    const r = calculate([{ productId: 3, quantity: 5 }], products, materials);
    expect(r.needs).toHaveLength(0);
    expect(r.productsWithoutRecipe).toEqual(["Пусто"]);
  });

  it("throws on unknown product", () => {
    expect(() => calculate([{ productId: 99, quantity: 1 }], products, materials)).toThrow();
  });
});
