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
      return NextResponse.json(
        { error: "Connected partner not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      _id: partner._id,
      name: partner.name,
      dayMessageLimit: partner.dayMessageLimit,
      phone: partner.phone,
    });
  } catch (error) {
    console.error("Error fetching partner data:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner data" },
      { status: 500 },
    );
  }
}
