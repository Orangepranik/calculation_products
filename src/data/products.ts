import type { Part } from "@/lib/calc";
import { kozhan4Parts } from "./kozhan-4";

export type Product = {
  slug: string;
  name: string;
  /** Путь в /public, например "/products/kozhan-4.jpg". Пока фото нет — плейсхолдер. */
  image?: string;
  /** Детали для калькуляции; нет — калькуляция ещё не задана */
  parts?: Part[];
};

export const products: Product[] = [
  { slug: "vynosna-antena", name: "Виносна антена" },
  { slug: "kozhan-3", name: "КОЖАН 3.0" },
  { slug: "kozhan-4", name: "КОЖАН 4.0", parts: kozhan4Parts },
  { slug: "gidra-2u", name: "ГІДРА 2U" },
  { slug: "delfin", name: "ДЕЛЬФІН" },
  { slug: "dokatka", name: "ДОКАТКА" },
  { slug: "kraken", name: "КРАКЕН" },
  { slug: "nich", name: "НІЧ" },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
