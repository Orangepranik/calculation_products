import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { PartsTable } from "@/components/PartsTable";

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
        ← Продукция
      </Link>
      <div className="mt-6 flex items-center gap-5">
        <div className="w-20 shrink-0 sm:w-24">
          <ProductImage product={product} sizes="96px" compact />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
      </div>
      <section className="mt-10">
        <h2 className="text-sm font-medium text-neutral-500">Калькуляция · 3D-печать</h2>
        {product.parts ? (
          <PartsTable parts={product.parts} />
        ) : (
          <p className="mt-3 text-sm text-neutral-400">Материалы и формулы ещё не заданы.</p>
        )}
      </section>
    </>
  );
}
