import { calculate } from "@/lib/calc";
import { getMaterials, getProductsWithRecipe } from "@/server/loaders";
import { clientIp, rateLimit } from "@/server/rate-limit";
import { calculateInput, firstError } from "@/server/validation";

export const dynamic = "force-dynamic";

const MAX_BODY = 16 * 1024;

export async function POST(req: Request) {
  const limit = rateLimit(`calc:${clientIp(req.headers)}`);
  if (!limit.ok) {
    return Response.json(
      { error: "Слишком много запросов" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Ожидается application/json" }, { status: 415 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "Слишком большой запрос" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = calculateInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: firstError(parsed.error) }, { status: 400 });

  const [products, materials] = await Promise.all([getProductsWithRecipe(), getMaterials()]);
  const known = new Set(products.map((p) => p.id));
  if (parsed.data.lines.some((l) => !known.has(l.productId))) {
    return Response.json({ error: "Продукт не найден" }, { status: 404 });
  }

  return Response.json(calculate(parsed.data.lines, products, materials));
}
