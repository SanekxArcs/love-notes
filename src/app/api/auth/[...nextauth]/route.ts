import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { guardRequest } from "@/lib/request-guard";

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  if (new URL(request.url).pathname.endsWith("/callback/credentials")) {
    const rejected = await guardRequest(request, {
      scope: "login",
      limit: 10,
      windowMs: 10 * 60 * 1000,
      checkBot: true,
    });
    if (rejected) return rejected;
  }
  return handlers.POST(request);
}
