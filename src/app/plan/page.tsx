import type { Metadata } from "next";
import { products } from "@/data/products";
import { PlanCalculator } from "@/components/PlanCalculator";
import { hasCalculation } from "@/lib/assembly";

export const metadata: Metadata = { title: "План виробництва" };

export default function PlanPage() {
  const withData = products.filter(hasCalculation);
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">План виробництва</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Вкажіть, скільки виробів кожного продукту потрібно — нижче зведення матеріалів, друку й кабелю на весь план.
      </p>
      <PlanCalculator products={withData} />
    </>
  );
}
