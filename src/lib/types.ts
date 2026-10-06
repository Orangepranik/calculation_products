// Public DTOs shared by server and client. Only whitelisted fields — no DB internals.

export type Material = {
  id: number;
  name: string;
  unit: string;
  packSize: number;
  packPrice: number | null;
  stock: number;
};

export type RecipeItem = {
  id: number;
  materialId: number;
  qtyPerUnit: number;
  wastePct: number;
};

export type Product = {
  id: number;
  name: string;
  unit: string;
};

export type ProductWithRecipe = Product & { recipe: RecipeItem[] };

export type OrderLine = { productId: number; quantity: number };

/** Вклад одной позиции заказа в потребность по материалу. */
export type Contribution = {
  productId: number;
  productName: string;
  productUnit: string;
  quantity: number;
  qtyPerUnit: number;
  wastePct: number;
  /** quantity × qtyPerUnit × (1 + wastePct / 100) */
  amount: number;
};

export type MaterialNeed = {
  material: Material;
  contributions: Contribution[];
  /** Σ amount — сколько материала уйдёт в производство. */
  required: number;
  /** max(0, required − stock) — сколько не хватает. */
  shortage: number;
  /** ceil(shortage / packSize) */
  packs: number;
  /** packs × packSize */
  purchaseQty: number;
  /** purchaseQty − shortage — останется на складе после производства сверх старого остатка. */
  surplus: number;
  /** packs × packPrice, null если цена не задана. */
  cost: number | null;
};

export type CalculationResult = {
  lines: { productId: number; productName: string; productUnit: string; quantity: number }[];
  needs: MaterialNeed[];
  totalCost: number;
  /** Есть материалы к закупке без цены — totalCost неполный. */
  hasUnpricedPurchases: boolean;
  /** Продукты без рецептуры — по ним ничего не посчитано. */
  productsWithoutRecipe: string[];
};
