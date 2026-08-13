import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConnectedPartner } from "@/lib/user-access";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partner } = await getConnectedPartner(session.user.id);
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ name: partner.name });
  } catch (error) {
    console.error("Error fetching partner information:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner information" },
      { status: 500 },
    );
  }
}
