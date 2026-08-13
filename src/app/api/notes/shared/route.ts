import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { getConnectedPartner } from "@/lib/user-access";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { partner: connectedPartner } = await getConnectedPartner(session.user.id);
    const partnerId = connectedPartner?._id;

    if (!partnerId) {
      return NextResponse.json({ notes: [] });
    }

    const partnerData = await sanityClient.fetch(
      `*[_type == "user" && _id == $partnerId][0]{
        name,
        "notes": partnerNotes[isShared == true]{
          _key,
          title,
          description,
          tags,
          onboardingQuestionId,
          perspective,
          corrections[]{ _key, authorId, authorName, text, createdAt }
        }
      }`,
      { partnerId }
    );

    return NextResponse.json({
      notes: partnerData?.notes ?? [],
      partnerName: partnerData?.name ?? "Партнер",
    });
  } catch (error) {
    console.error("Error fetching partner's shared notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner's shared notes" },
      { status: 500 }
    );
  }
}
