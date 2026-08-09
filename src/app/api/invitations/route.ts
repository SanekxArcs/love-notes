import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("from")?.trim();

  if (!partnerId) {
    return NextResponse.json({ error: "Invitation code is required" }, { status: 400 });
  }

  try {
    const inviter = await sanityClient.fetch<{ name?: string } | null>(
      '*[_type == "user" && partnerIdToSend == $partnerId][0]{ name }',
      { partnerId },
    );

    if (!inviter) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({ name: inviter.name || "Твій партнер" });
  } catch (error) {
    console.error("Error loading invitation:", error);
    return NextResponse.json({ error: "Failed to load invitation" }, { status: 500 });
  }
}
