import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectPartner } from "@/lib/user-access";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partnerId } = await request.json();
  if (typeof partnerId !== "string" || !partnerId.trim()) {
    return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
  }

  try {
    const result = await connectPartner(session.user.id, partnerId);
    if (!result.ok && result.reason === "partner-already-connected") {
      return NextResponse.json(
        { error: "Partner is already connected to another account" },
        { status: 409 },
      );
    }
    if (!result.ok) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error connecting partner:", error);
    return NextResponse.json({ error: "Failed to connect partner" }, { status: 500 });
  }
}
