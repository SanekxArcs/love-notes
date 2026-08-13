import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { guardRequest } from "@/lib/request-guard";

export async function GET(request: Request) {
  const rejected = await guardRequest(request, {
    scope: "check-login",
    limit: 30,
    windowMs: 60 * 1000,
    checkBot: true,
  });
  if (rejected) return rejected;

  try {
    const login = new URL(request.url).searchParams.get("login")?.trim();
    if (!login || login.length > 100) {
      return NextResponse.json({ error: "Valid login parameter is required" }, { status: 400 });
    }
    const existingUser = await sanityClient.fetch<string | null>(
      `*[_type == "user" && login == $login][0]._id`,
      { login },
    );
    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Error checking login availability:", error);
    return NextResponse.json({ error: "Failed to check login availability" }, { status: 500 });
  }
}
