import { calcMaterials, listProcesses, type MaterialCategory, type MaterialItem } from "./bom";
import type { Part } from "./calc";
import type { WireCut } from "./wires";

export type SectionId = "components" | "fasteners" | "consumables" | "cuts" | "print" | "wires" | `process-${number}`;

export type SectionCount = { id: SectionId; label: string; count: number };

export const processSectionId = (index: number): SectionId => `process-${index + 1}`;

const materialSections: { id: SectionId; label: string; category: MaterialCategory }[] = [
  { id: "components", label: "Комплектуючі", category: "component" },
  { id: "fasteners", label: "Кріплення", category: "fastener" },
  { id: "consumables", label: "Витратні матеріали", category: "consumable" },
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
  const byCategory = (c: MaterialCategory) => totals.filter((t) => t.category === c && !t.process).length;
  const processes = materials ? listProcesses(materials) : [];

  const sections: SectionCount[] = [
    ...materialSections.map((s) => ({ id: s.id, label: s.label, count: byCategory(s.category) })),
    { id: "print", label: "3D-друк", count: parts?.length ?? 0 },
    { id: "wires", label: "Нарізання кабелю", count: wires?.length ?? 0 },
    ...processes.map((p, i) => ({
      id: processSectionId(i),
      label: p,
      count: totals.filter((t) => t.process === p).length,
    })),
  ];
  return sections.filter((s) => s.count > 0);
}
