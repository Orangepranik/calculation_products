import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Сторінку не знайдено</h1>
      <Link href="/" className="mt-4 inline-block text-sm text-neutral-500 transition-colors hover:text-neutral-900">
        ← Продукція
      </Link>
    </>
  );
}
