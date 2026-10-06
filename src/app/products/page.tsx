import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { createProduct } from "@/server/actions";
import { getProductsWithRecipe } from "@/server/loaders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Продукция" };

export default async function ProductsPage() {
  const products = await getProductsWithRecipe();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Продукция</h1>
        <p className="mt-1 text-sm text-slate-500">Для каждого продукта задаётся рецептура — нормы расхода материалов на 1 единицу.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-medium">Новый продукт</h2>
        <ActionForm action={createProduct} className="flex flex-wrap items-end gap-2">
          <Field label="Название" name="name" required maxLength={120} className="min-w-56 flex-1" />
          <Field label="Ед. изм." name="unit" defaultValue="шт" required maxLength={16} className="w-28" />
          <SubmitButton>Создать</SubmitButton>
        </ActionForm>
      </section>

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">Продукции пока нет.</p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span>
                  {p.name} <span className="text-sm text-slate-500">({p.unit})</span>
                </span>
                <span className={`text-sm ${p.recipe.length ? "text-slate-500" : "text-amber-600"}`}>
                  {p.recipe.length ? `материалов в рецептуре: ${p.recipe.length}` : "нет рецептуры"} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
