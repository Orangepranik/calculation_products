import "server-only";
import type { materials, products, recipeItems } from "@/db/schema";
import type { Material, Product, ProductWithRecipe, RecipeItem } from "@/lib/types";

type MaterialRow = typeof materials.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type RecipeRow = typeof recipeItems.$inferSelect;

export function toMaterial(r: MaterialRow): Material {
  return {
    id: r.id,
    name: r.name,
    unit: r.unit,
    packSize: Number(r.packSize),
    packPrice: r.packPrice === null ? null : Number(r.packPrice),
    stock: Number(r.stock),
  };
}

export function toRecipeItem(r: RecipeRow): RecipeItem {
  return {
    id: r.id,
    materialId: r.materialId,
    qtyPerUnit: Number(r.qtyPerUnit),
    wastePct: Number(r.wastePct),
  };
}

export function toProduct(r: ProductRow): Product {
  return { id: r.id, name: r.name, unit: r.unit };
}

export function toProductWithRecipe(r: ProductRow & { recipe: RecipeRow[] }): ProductWithRecipe {
  return { ...toProduct(r), recipe: r.recipe.map(toRecipeItem) };
}
