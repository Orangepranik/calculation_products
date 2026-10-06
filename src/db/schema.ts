import { relations } from "drizzle-orm";
import {
  check,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// numeric(14,4) comes back from postgres.js as string — converted to number in mappers.

/** Сырьё / материалы, которые закупаются. */
export const materials = pgTable(
  "materials",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    /** Единица измерения: кг, м, л, шт … */
    unit: text("unit").notNull(),
    /** Сколько единиц в одной упаковке (закупка кратна упаковке). */
    packSize: numeric("pack_size", { precision: 14, scale: 4 }).notNull().default("1"),
    /** Цена за упаковку, опционально. */
    packPrice: numeric("pack_price", { precision: 14, scale: 2 }),
    /** Остаток на складе в единицах материала. */
    stock: numeric("stock", { precision: 14, scale: 4 }).notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("materials_name_uq").on(t.name),
    check("materials_pack_size_pos", sql`${t.packSize} > 0`),
    check("materials_stock_nonneg", sql`${t.stock} >= 0`),
  ],
);

/** Готовая продукция. */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    unit: text("unit").notNull().default("шт"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("products_name_uq").on(t.name)],
);

/** Норма расхода (рецептура / BOM): сколько материала уходит на 1 единицу продукции. */
export const recipeItems = pgTable(
  "recipe_items",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "restrict" }),
    qtyPerUnit: numeric("qty_per_unit", { precision: 14, scale: 4 }).notNull(),
    /** Процент технологических потерь / отходов. */
    wastePct: numeric("waste_pct", { precision: 6, scale: 2 }).notNull().default("0"),
  },
  (t) => [
    uniqueIndex("recipe_items_product_material_uq").on(t.productId, t.materialId),
    check("recipe_items_qty_pos", sql`${t.qtyPerUnit} > 0`),
    check("recipe_items_waste_range", sql`${t.wastePct} >= 0 AND ${t.wastePct} < 1000`),
  ],
);

export const productsRelations = relations(products, ({ many }) => ({
  recipe: many(recipeItems),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  usedIn: many(recipeItems),
}));

export const recipeItemsRelations = relations(recipeItems, ({ one }) => ({
  product: one(products, { fields: [recipeItems.productId], references: [products.id] }),
  material: one(materials, { fields: [recipeItems.materialId], references: [materials.id] }),
}));
