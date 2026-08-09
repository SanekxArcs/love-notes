import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

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
    const partner = await sanityClient.fetch<{ _id: string } | null>(
      '*[_type == "user" && partnerIdToSend == $partnerId][0]{ _id }',
      { partnerId: partnerId.trim() },
    );

    if (!partner || partner._id === session.user.id) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    await sanityClient.patch(session.user.id).set({ partnerIdToReceiveFrom: partnerId.trim() }).commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error connecting partner:", error);
    return NextResponse.json({ error: "Failed to connect partner" }, { status: 500 });
  }
}
