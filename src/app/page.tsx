import { getProductsWithRecipe } from "@/server/loaders";
import { Calculator } from "./calculator";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProductsWithRecipe();
  return (
    <>
      <h1 className="text-2xl font-semibold">Расчёт закупки материалов</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Укажите, сколько продукции нужно произвести — калькулятор посчитает, сколько материалов
        закупить с учётом норм расхода, потерь, складских остатков и фасовки.
      </p>
      <Calculator
        products={products.map((p) => ({ id: p.id, name: p.name, unit: p.unit, hasRecipe: p.recipe.length > 0 }))}
      />
    </>
  );
}
