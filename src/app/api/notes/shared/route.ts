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
      notes: partner?.notes ?? [],
      partnerName: partner?.name ?? "Партнер",
    });
  } catch (error) {
    console.error("Error fetching partner's shared notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner's shared notes" },
      { status: 500 }
    );
  }
}
