import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

type RateEntry = { count: number; resetAt: number };
type RateStore = Map<string, RateEntry>;

const globalRateStore = globalThis as typeof globalThis & {
  loveNotesRateStore?: RateStore;
};
const rateStore = globalRateStore.loveNotesRateStore ?? new Map();
globalRateStore.loveNotesRateStore = rateStore;

function getClientIp(request: Request) {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function rateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${getClientIp(request)}`;
  const current = rateStore.get(key);

  if (!current || current.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

function pruneStore() {
  if (rateStore.size < 2_000) return;
  const now = Date.now();
  for (const [key, entry] of rateStore) {
    if (entry.resetAt <= now) rateStore.delete(key);
  }
}

export async function guardRequest(
  request: Request,
  options: {
    scope: string;
    limit: number;
    windowMs: number;
    checkBot?: boolean;
  },
) {
  pruneStore();
  const rateResponse = rateLimit(
    request,
    options.scope,
    options.limit,
    options.windowMs,
  );
  if (rateResponse) return rateResponse;

  if (options.checkBot && process.env.VERCEL) {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: "basic" },
    });
    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  return null;
}
