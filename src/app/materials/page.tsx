import type { Metadata } from "next";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { Material } from "@/lib/types";
import { createMaterial, deleteMaterial, updateMaterial } from "@/server/actions";
import { getMaterials } from "@/server/loaders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Материалы" };

const rowClass = "grid grid-cols-2 items-end gap-2 sm:grid-cols-[2fr_0.7fr_1fr_1fr_1fr_auto]";

function MaterialFields({ m, hideLabels }: { m?: Material; hideLabels?: boolean }) {
  return (
    <>
      <Field label="Название" name="name" defaultValue={m?.name} required maxLength={120} hideLabel={hideLabels} className="col-span-2 sm:col-span-1" />
      <Field label="Ед. изм." name="unit" defaultValue={m?.unit ?? "кг"} required maxLength={16} hideLabel={hideLabels} />
      <Field label="Размер упаковки" name="packSize" defaultValue={m?.packSize ?? 1} inputMode="decimal" required hideLabel={hideLabels} />
      <Field label="Цена упаковки" name="packPrice" defaultValue={m?.packPrice ?? ""} inputMode="decimal" placeholder="—" hideLabel={hideLabels} />
      <Field label="Остаток на складе" name="stock" defaultValue={m?.stock ?? 0} inputMode="decimal" hideLabel={hideLabels} />
    </>
  );
}

export default async function MaterialsPage() {
  const materials = await getMaterials();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Материалы</h1>
        <p className="mt-1 text-sm text-slate-500">
          Сырьё и комплектующие. Закупка округляется вверх до целого числа упаковок, остаток на складе вычитается из потребности.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-medium">Новый материал</h2>
        <ActionForm action={createMaterial} resetOnSuccess className={rowClass}>
          <MaterialFields />
          <SubmitButton>Добавить</SubmitButton>
        </ActionForm>
      </section>

      <section className="space-y-2">
        {materials.length === 0 ? (
          <p className="text-sm text-slate-500">Материалов пока нет.</p>
        ) : (
          <>
            <div className={`${rowClass} hidden px-4 text-xs text-slate-500 sm:grid`}>
              <span>Название</span>
              <span>Ед.</span>
              <span>Упаковка</span>
              <span>Цена уп.</span>
              <span>Склад</span>
              <span />
            </div>
            {materials.map((m) => (
              <div key={m.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                {/* key includes values so defaultValue refreshes after save */}
                <ActionForm key={JSON.stringify(m)} action={updateMaterial} className={`${rowClass} flex-1`}>
                  <input type="hidden" name="id" value={m.id} />
                  <MaterialFields m={m} hideLabels />
                  <SubmitButton variant="secondary">Сохранить</SubmitButton>
                </ActionForm>
                <ActionForm action={deleteMaterial} confirm={`Удалить «${m.name}»?`}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitButton variant="danger" title="Удалить">✕</SubmitButton>
                </ActionForm>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
