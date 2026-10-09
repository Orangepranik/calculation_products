import type { Part } from "@/lib/calc";
import type { WireCut } from "@/lib/wires";
import type { MaterialItem } from "@/lib/bom";
import { kozhan4Materials, kozhan4Parts, kozhan4Wires } from "./kozhan-4";
import { vynosnaAntenaMaterials, vynosnaAntenaWires } from "./vynosna-antena";
import { antena5gMaterials, antena5gParts } from "./antena-5g";

export type Product = {
  slug: string;
  name: string;
  /** Подпись под названием (модификация и т. п.) */
  subtitle?: string;
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
  { slug: "antena-5g", name: "Антена 5G", parts: antena5gParts, materials: antena5gMaterials },
  { slug: "kozhan-3", name: "КОЖАН 3.0" },
  { slug: "kozhan-4", name: "КОЖАН 4.0", image: "/products/kozhan-4.webp", parts: kozhan4Parts, wires: kozhan4Wires, materials: kozhan4Materials },
  { slug: "gidra-2u", name: "ГІДРА 2U", image: "/products/gidra-2u.webp" },
  { slug: "delfin", name: "ДЕЛЬФІН", image: "/products/delfin.webp" },
  { slug: "dokatka", name: "ДОКАТКА", image: "/products/dokatka.webp" },
  { slug: "kraken", name: "КРАКЕН", image: "/products/kraken.webp" },
  { slug: "nich", name: "НІЧ", subtitle: "Модифікація: поворотна камера", image: "/products/nich.webp" },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
