import type { MaterialItem } from "@/lib/bom";
import type { WireCut } from "@/lib/wires";

const component = (n: number, count: number): MaterialItem => ({ name: `PRODUCT${n}`, category: "component", count });

/** Виносна антена — список материалов на одно изделие. PRODUCTn — внутренние названия фирмы. */
export const vynosnaAntenaMaterials: MaterialItem[] = [
  component(1, 1),
  component(2, 1),
  component(3, 1),
  component(4, 5),
  component(5, 1),
  { name: "PRODUCT6", category: "cut", count: 1, lengthCm: 250 },
  { name: "PRODUCT7", category: "cut", count: 1, lengthCm: 14 },
  component(8, 1),
  component(9, 1),
  component(10, 1),
  component(11, 1),
  component(12, 4),
  component(13, 1),
  component(14, 1),
  component(15, 1),
  component(16, 1),
  component(17, 1),
  // PRODUCT18 (кабель AWG18) — в нарезке кабеля, см. vynosnaAntenaWires
  component(19, 1),
  component(20, 4),
  component(21, 4),
  { name: "Термоусадка", code: "PRODUCT22", category: "cut", count: 4, lengthCm: 1.5 },
  { name: "Термоусадка", code: "PRODUCT23", category: "cut", count: 1, lengthCm: 5 },
  // В исходных данных «4x12м» — взято буквально (4 отрезка по 12 м). Уточнить: возможно, 12 см.
  { name: "RG-316", code: "PRODUCT24", category: "cut", count: 4, lengthCm: 1200 },
];

/** Виносна антена — нарезка кабеля */
export const vynosnaAntenaWires: WireCut[] = [
  { group: "PRODUCT18", gauge: "AWG18", colors: ["чорний"], lengthCm: 5, count: 2 },
];
