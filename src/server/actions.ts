"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { materials, products, recipeItems } from "@/db/schema";
import { firstError, id, materialInput, pick, productInput, recipeItemInput } from "./validation";

export type ActionState = { error?: string; ok?: boolean };

const MATERIAL_KEYS = ["name", "unit", "packSize", "packPrice", "stock"] as const;
const RECIPE_KEYS = ["materialId", "qtyPerUnit", "wastePct"] as const;

/** Postgres error code from drizzle/postgres.js (may be wrapped in `cause`). */
function pgCode(e: unknown): string | undefined {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code ?? err?.cause?.code;
}

function dbError(e: unknown): ActionState {
  switch (pgCode(e)) {
    case "23505":
      return { error: "Запись с таким названием уже существует" };
    case "23503":
      return { error: "Нельзя удалить: материал используется в рецептурах" };
    case "23514":
      return { error: "Значение вне допустимого диапазона" };
    default:
      console.error(e);
      return { error: "Ошибка базы данных" };
  }
}

function toDb(n: number | undefined | null): string | null {
  return n === undefined || n === null ? null : String(n);
}

// ── Materials ────────────────────────────────────────────────

export async function createMaterial(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = materialInput.safeParse(pick(fd, MATERIAL_KEYS));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const v = parsed.data;
  try {
    await db.insert(materials).values({
      name: v.name,
      unit: v.unit,
      packSize: String(v.packSize),
      packPrice: toDb(v.packPrice),
      stock: String(v.stock),
    });
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateMaterial(_: ActionState, fd: FormData): Promise<ActionState> {
  const materialId = id.safeParse(fd.get("id"));
  const parsed = materialInput.safeParse(pick(fd, MATERIAL_KEYS));
  if (!materialId.success) return { error: "Некорректный id" };
  if (!parsed.success) return { error: firstError(parsed.error) };
  const v = parsed.data;
  try {
    await db
      .update(materials)
      .set({
        name: v.name,
        unit: v.unit,
        packSize: String(v.packSize),
        packPrice: toDb(v.packPrice),
        stock: String(v.stock),
      })
      .where(eq(materials.id, materialId.data));
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteMaterial(_: ActionState, fd: FormData): Promise<ActionState> {
  const materialId = id.safeParse(fd.get("id"));
  if (!materialId.success) return { error: "Некорректный id" };
  try {
    await db.delete(materials).where(eq(materials.id, materialId.data));
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Products ─────────────────────────────────────────────────

export async function createProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = productInput.safeParse(pick(fd, ["name", "unit"]));
  if (!parsed.success) return { error: firstError(parsed.error) };
  let newId: number;
  try {
    const [row] = await db.insert(products).values(parsed.data).returning({ id: products.id });
    newId = row!.id;
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  redirect(`/products/${newId}`);
}

export async function updateProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const productId = id.safeParse(fd.get("id"));
  const parsed = productInput.safeParse(pick(fd, ["name", "unit"]));
  if (!productId.success) return { error: "Некорректный id" };
  if (!parsed.success) return { error: firstError(parsed.error) };
  try {
    await db.update(products).set(parsed.data).where(eq(products.id, productId.data));
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const productId = id.safeParse(fd.get("id"));
  if (!productId.success) return { error: "Некорректный id" };
  try {
    await db.delete(products).where(eq(products.id, productId.data));
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  redirect("/products");
}

// ── Recipe items ─────────────────────────────────────────────

export async function upsertRecipeItem(_: ActionState, fd: FormData): Promise<ActionState> {
  const productId = id.safeParse(fd.get("productId"));
  const parsed = recipeItemInput.safeParse(pick(fd, RECIPE_KEYS));
  if (!productId.success) return { error: "Некорректный id" };
  if (!parsed.success) return { error: firstError(parsed.error) };
  const v = parsed.data;
  try {
    await db
      .insert(recipeItems)
      .values({
        productId: productId.data,
        materialId: v.materialId,
        qtyPerUnit: String(v.qtyPerUnit),
        wastePct: String(v.wastePct),
      })
      .onConflictDoUpdate({
        target: [recipeItems.productId, recipeItems.materialId],
        set: { qtyPerUnit: String(v.qtyPerUnit), wastePct: String(v.wastePct) },
      });
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRecipeItem(_: ActionState, fd: FormData): Promise<ActionState> {
  const itemId = id.safeParse(fd.get("id"));
  const productId = id.safeParse(fd.get("productId"));
  if (!itemId.success || !productId.success) return { error: "Некорректный id" };
  try {
    await db
      .delete(recipeItems)
      .where(and(eq(recipeItems.id, itemId.data), eq(recipeItems.productId, productId.data)));
  } catch (e) {
    return dbError(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
