import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Калькулятор производства", template: "%s · Калькулятор производства" },
  description: "Расчёт материалов для закупки под план выпуска продукции",
};

const nav = [
  { href: "/", label: "Расчёт" },
  { href: "/products", label: "Продукция" },
  { href: "/materials", label: "Материалы" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
            <span className="mr-4 font-semibold">⚙️ Калькулятор</span>
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
