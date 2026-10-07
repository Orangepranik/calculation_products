import type { Part } from "@/lib/calc";
import type { WireCut } from "@/lib/wires";
import type { MaterialItem } from "@/lib/bom";
import { kozhan4Materials, kozhan4Parts, kozhan4Wires } from "./kozhan-4";
import { vynosnaAntenaMaterials, vynosnaAntenaWires } from "./vynosna-antena";

export type Product = {
  slug: string;
  name: string;
  /** Путь в /public, например "/products/kozhan-4.jpg". Пока фото нет — плейсхолдер. */
  image?: string;
  /** Детали для калькуляции; нет — калькуляция ещё не задана */
  parts?: Part[];
  /** Нарезка кабеля */
  wires?: WireCut[];
  /** Список материалов (комплектующие, крепёж, расходники) */
  materials?: MaterialItem[];
};

export const products: Product[] = [
  { slug: "vynosna-antena", name: "Виносна антена", materials: vynosnaAntenaMaterials, wires: vynosnaAntenaWires },
  { slug: "kozhan-3", name: "КОЖАН 3.0" },
  { slug: "kozhan-4", name: "КОЖАН 4.0", parts: kozhan4Parts, wires: kozhan4Wires, materials: kozhan4Materials },
  { slug: "gidra-2u", name: "ГІДРА 2U" },
  { slug: "delfin", name: "ДЕЛЬФІН" },
  { slug: "dokatka", name: "ДОКАТКА" },
  { slug: "kraken", name: "КРАКЕН" },
  { slug: "nich", name: "НІЧ" },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
