import Image from "next/image";
import type { Product } from "@/data/products";

export function ProductImage({ product, sizes, compact }: { product: Product; sizes: string; compact?: boolean }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-50 outline outline-1 -outline-offset-1 outline-black/5">
      {product.image ? (
        <Image src={product.image} alt={product.name} fill sizes={sizes} className={compact ? "object-contain p-2" : "object-contain p-6"} />
      ) : (
        !compact && <div className="flex h-full items-center justify-center text-xs text-neutral-400">Фото незабаром</div>
      )}
    </div>
  );
}
