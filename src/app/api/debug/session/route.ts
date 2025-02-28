// app/api/debug/session/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    authenticated: !!session,
    session,
  });
}
