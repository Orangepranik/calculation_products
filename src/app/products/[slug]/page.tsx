import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { ProductCalculator } from "@/components/ProductCalculator";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  return { title: getProduct(slug)?.name };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <Link href="/" className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
        ← Продукція
      </Link>
      <div className="mt-6 flex items-center gap-5">
        <div className="w-20 shrink-0 sm:w-24">
          <ProductImage product={product} sizes="96px" compact />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          {product.subtitle && <p className="mt-1 text-sm text-neutral-500">{product.subtitle}</p>}
        </div>
      </div>
      {product.parts || product.wires || product.materials ? (
        <ProductCalculator
          parts={product.parts}
          wires={product.wires}
          materials={product.materials}
        />
      ) : (
        <p className="mt-10 text-sm text-neutral-400">Матеріали та формули ще не задані.</p>
      )}
    </>
  );
}
