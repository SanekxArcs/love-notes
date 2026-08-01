import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const partnerId = session.user.partnerIdToReceiveFrom;

    if (!partnerId) {
      return NextResponse.json({ notes: [] });
    }

    const partner = await sanityClient.fetch(
      `*[_type == "user" && partnerIdToSend == $partnerId][0]{
        "notes": partnerNotes[isShared == true]{
          _key,
          title,
          description,
          tags
        }
      }`,
      { partnerId }
    );

    return NextResponse.json({ notes: partner?.notes ?? [] });
  } catch (error) {
    console.error("Error fetching partner's shared notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner's shared notes" },
      { status: 500 }
    );
  }
}
