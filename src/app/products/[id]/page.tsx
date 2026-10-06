import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Field, inputClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { deleteProduct, deleteRecipeItem, updateProduct, upsertRecipeItem } from "@/server/actions";
import { getMaterials, getProduct } from "@/server/loaders";
import { id as idSchema } from "@/server/validation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function load(params: Props["params"]) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const product = await getProduct(parsed.data);
  if (!product) notFound();
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await load(params)).name };
}

const rowClass = "grid grid-cols-2 items-end gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]";

export default async function ProductPage({ params }: Props) {
  const [product, materials] = await Promise.all([load(params), getMaterials()]);
  const materialById = new Map(materials.map((m) => [m.id, m]));
  const used = new Set(product.recipe.map((r) => r.materialId));
  const available = materials.filter((m) => !used.has(m.id));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/products" className="text-sm text-indigo-600 hover:underline">← Вся продукция</Link>
        <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-2">
          <ActionForm key={`${product.name}|${product.unit}`} action={updateProduct} className="flex flex-1 flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={product.id} />
            <Field label="Название" name="name" defaultValue={product.name} required maxLength={120} className="min-w-56 flex-1" />
            <Field label="Ед. изм." name="unit" defaultValue={product.unit} required maxLength={16} className="w-28" />
            <SubmitButton variant="secondary">Сохранить</SubmitButton>
          </ActionForm>
          <ActionForm action={deleteProduct} confirm={`Удалить «${product.name}» вместе с рецептурой?`}>
            <input type="hidden" name="id" value={product.id} />
            <SubmitButton variant="danger">Удалить продукт</SubmitButton>
          </ActionForm>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Рецептура на 1 {product.unit}</h2>
          <p className="text-sm text-slate-500">
            Норма — сколько материала уходит на одну единицу продукции. Потери — технологические отходы в %, добавляются сверху.
          </p>
        </div>

        {product.recipe.length > 0 && (
          <div className={`${rowClass} hidden px-3 text-xs text-slate-500 sm:grid`}>
            <span>Материал</span>
            <span>Норма на 1 {product.unit}</span>
            <span>Потери, %</span>
            <span />
          </div>
        )}

        {product.recipe.map((item) => {
          const m = materialById.get(item.materialId);
          return (
            <div key={item.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <ActionForm key={`${item.qtyPerUnit}|${item.wastePct}`} action={upsertRecipeItem} className={`${rowClass} flex-1`}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="materialId" value={item.materialId} />
                <span className="col-span-2 py-2 text-sm sm:col-span-1">{m?.name}</span>
                <Field label={`Норма, ${m?.unit}`} name="qtyPerUnit" defaultValue={item.qtyPerUnit} inputMode="decimal" required hideLabel />
                <Field label="Потери, %" name="wastePct" defaultValue={item.wastePct} inputMode="decimal" hideLabel />
                <SubmitButton variant="secondary">Сохранить</SubmitButton>
              </ActionForm>
              <ActionForm action={deleteRecipeItem}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="productId" value={product.id} />
                <SubmitButton variant="danger" title="Убрать из рецептуры">✕</SubmitButton>
              </ActionForm>
            </div>
          );
        })}

        <div className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          {materials.length === 0 ? (
            <p className="text-sm text-slate-500">
              Сначала добавьте <Link href="/materials" className="text-indigo-600 underline">материалы</Link>.
            </p>
          ) : available.length === 0 ? (
            <p className="text-sm text-slate-500">Все материалы уже в рецептуре.</p>
          ) : (
            <ActionForm action={upsertRecipeItem} resetOnSuccess className={rowClass}>
              <input type="hidden" name="productId" value={product.id} />
              <label className="col-span-2 flex flex-col gap-1 text-xs text-slate-500 sm:col-span-1">
                Материал
                <select name="materialId" className={inputClass} required>
                  {available.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </select>
              </label>
              <Field label={`Норма на 1 ${product.unit}`} name="qtyPerUnit" inputMode="decimal" required placeholder="0" />
              <Field label="Потери, %" name="wastePct" inputMode="decimal" defaultValue={0} />
              <SubmitButton>Добавить</SubmitButton>
            </ActionForm>
          )}
        </div>
      </section>
    </div>
  );
}
