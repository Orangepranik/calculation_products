// Demo data: `npm run db:seed`. Idempotent — skips if products already exist.
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { materials, products, recipeItems } from "./schema";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

async function main() {
  if ((await db.select({ id: products.id }).from(products).limit(1)).length) {
    console.log("already seeded, skipping");
    return;
  }

  await db.transaction(async (tx) => {
    const m = await tx
      .insert(materials)
      .values([
        { name: "Доска сосна 25×100", unit: "м", packSize: "6", packPrice: "420", stock: "30" },
        { name: "Брус 50×50", unit: "м", packSize: "3", packPrice: "260", stock: "0" },
        { name: "Саморез 4×40", unit: "шт", packSize: "200", packPrice: "350", stock: "150" },
        { name: "Клей ПВА", unit: "л", packSize: "1", packPrice: "180", stock: "0.5" },
        { name: "Лак", unit: "л", packSize: "2.5", packPrice: null, stock: "0" },
      ])
      .returning({ id: materials.id, name: materials.name });
    const mat = Object.fromEntries(m.map((r) => [r.name, r.id])) as Record<string, number>;

    const p = await tx
      .insert(products)
      .values([
        { name: "Табурет", unit: "шт" },
        { name: "Полка настенная", unit: "шт" },
      ])
      .returning({ id: products.id, name: products.name });
    const prod = Object.fromEntries(p.map((r) => [r.name, r.id])) as Record<string, number>;

    await tx.insert(recipeItems).values([
      { productId: prod["Табурет"]!, materialId: mat["Доска сосна 25×100"]!, qtyPerUnit: "1.2", wastePct: "10" },
      { productId: prod["Табурет"]!, materialId: mat["Брус 50×50"]!, qtyPerUnit: "2", wastePct: "5" },
      { productId: prod["Табурет"]!, materialId: mat["Саморез 4×40"]!, qtyPerUnit: "16", wastePct: "3" },
      { productId: prod["Табурет"]!, materialId: mat["Клей ПВА"]!, qtyPerUnit: "0.05", wastePct: "0" },
      { productId: prod["Табурет"]!, materialId: mat["Лак"]!, qtyPerUnit: "0.15", wastePct: "10" },
      { productId: prod["Полка настенная"]!, materialId: mat["Доска сосна 25×100"]!, qtyPerUnit: "2.4", wastePct: "8" },
      { productId: prod["Полка настенная"]!, materialId: mat["Саморез 4×40"]!, qtyPerUnit: "8", wastePct: "3" },
      { productId: prod["Полка настенная"]!, materialId: mat["Лак"]!, qtyPerUnit: "0.1", wastePct: "10" },
    ]);
  });
  console.log("seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
