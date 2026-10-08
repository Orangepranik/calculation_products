import { calcMaterials, type MaterialCategory, type MaterialItem } from "./bom";
import type { Part } from "./calc";
import type { WireCut } from "./wires";

export type SectionId = "components" | "fasteners" | "cuts" | "print" | "wires" | "packaging";

export type SectionCount = { id: SectionId; label: string; count: number };

const materialSections: { id: SectionId; label: string; category: MaterialCategory }[] = [
  { id: "components", label: "Комплектуючі", category: "component" },
  { id: "fasteners", label: "Кріплення", category: "fastener" },
  { id: "cuts", label: "Нарізання на відрізки", category: "cut" },
];

/** Сколько позиций нужно подготовить для сборки, по разделам страницы (в порядке вывода) */
export function countPositions({
  parts,
  wires,
  materials,
}: {
  parts?: Part[];
  wires?: WireCut[];
  materials?: MaterialItem[];
}): SectionCount[] {
  // Одинаковые материалы из разных строк — одна позиция
  const totals = materials ? calcMaterials(materials, 1).totals : [];
  const byCategory = (c: MaterialCategory) => totals.filter((t) => t.category === c).length;

  const sections: SectionCount[] = [
    ...materialSections.map((s) => ({ id: s.id, label: s.label, count: byCategory(s.category) })),
    { id: "print", label: "3D-друк", count: parts?.length ?? 0 },
    { id: "wires", label: "Нарізання кабелю", count: wires?.length ?? 0 },
    { id: "packaging", label: "Пакування", count: byCategory("packaging") },
  ];
  return sections.filter((s) => s.count > 0);
}
