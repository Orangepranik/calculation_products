import { hm, type Part } from "@/lib/calc";
import type { MaterialItem } from "@/lib/bom";

/** Антена 5G — 3D-печать. Верх (PRODUCT1) и низ (PRODUCT2) печатаются парой. */
export const antena5gParts: Part[] = [
  { no: 1, name: "Верх + низ (PRODUCT1, PRODUCT2)", unit: "пар", batch: { quantity: 12, minutes: hm(3, 6), grams: 66.57 }, perAssembly: 1 },
];

/** Антена 5G — список материалов на одно изделие. PRODUCTn — внутренние названия фирмы. */
export const antena5gMaterials: MaterialItem[] = [
  { name: "PRODUCT3", category: "component", count: 1 },
  { name: "PRODUCT5", category: "cut", count: 1, lengthCm: 5.5 },
  { name: "Гільза обжиму НТ 10.2-12 (наконечник трубчастий, втулковий ізольований)", category: "consumable", count: 1 },
];
