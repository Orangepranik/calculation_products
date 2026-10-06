import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { materials, products, recipeItems } from "@/db/schema";
import type { Material, ProductWithRecipe } from "@/lib/types";
import { toMaterial, toProductWithRecipe } from "./mappers";

export async function getMaterials(): Promise<Material[]> {
  const rows = await db.select().from(materials).orderBy(asc(materials.name));
  return rows.map(toMaterial);
}

export async function getProductsWithRecipe(): Promise<ProductWithRecipe[]> {
  const rows = await db.query.products.findMany({
    orderBy: asc(products.name),
    with: { recipe: { orderBy: asc(recipeItems.id) } },
  });
  return rows.map(toProductWithRecipe);
}

export async function getProduct(id: number): Promise<ProductWithRecipe | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { recipe: { orderBy: asc(recipeItems.id) } },
  });
  return row ? toProductWithRecipe(row) : null;
}
