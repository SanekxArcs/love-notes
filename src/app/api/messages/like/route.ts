import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

interface LikeRequestBody {
  messageKey: string;
  liked: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageKey, liked } = await request.json() as LikeRequestBody;

    if (!messageKey) {
      return NextResponse.json(
        { error: "Message key is required" },
        { status: 400 }
      );
    }

    const ownerId = await sanityClient.fetch(
      `*[_type == "user" && count(messages[_key == $key]) > 0][0]._id`,
      { key: messageKey }
    );

    if (!ownerId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await sanityClient
      .patch(ownerId)
      .set({ [`messages[_key=="${messageKey}"].like`]: liked })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating message like status:", error);
    return NextResponse.json(
      { error: "Failed to update like status" },
      { status: 500 }
    );
  }
}
