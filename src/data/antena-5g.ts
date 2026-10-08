import type { MaterialItem } from "@/lib/bom";

/**
 * Антена 5G — список материалов на одно изделие. PRODUCTn — внутренние названия фирмы.
 * PRODUCT1/2 — 3D-печатные детали; данные печати (партия, время, граммы) добавить позже.
 */
export const antena5gMaterials: MaterialItem[] = [
  { name: "3D друк верх", code: "PRODUCT1", category: "component", count: 1 },
  { name: "3D друк низ", code: "PRODUCT2", category: "component", count: 1 },
  { name: "PRODUCT3", category: "component", count: 1 },
  { name: "PRODUCT5", category: "component", count: 1 },
];
