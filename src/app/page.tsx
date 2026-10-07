import Link from "next/link";
import { products } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Продукція</h1>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.slug}>
            <Link href={`/products/${product.slug}`} className="group block">
              <ProductImage product={product} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
              <p className="mt-3 text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-500">
                {product.name}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
