import "server-only";

// Simple fixed-window per-IP limiter (in-memory, single instance — enough for a pet project).
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function clientIp(headers: Headers): string {
  // Behind Cloudflare the real client IP is in CF-Connecting-IP; otherwise the first X-Forwarded-For hop.
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

export function rateLimit(key: string, limit = 60): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}
