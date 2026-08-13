import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { getConnectedPartner, isValidArrayKey } from "@/lib/user-access";

interface LikeRequestBody {
  messageKey: string;
  liked: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageKey, liked } = (await request.json()) as LikeRequestBody;
    if (!isValidArrayKey(messageKey) || typeof liked !== "boolean") {
      return NextResponse.json(
        { error: "A valid message key and like state are required" },
        { status: 400 },
      );
    }

    const { partner } = await getConnectedPartner(session.user.id);
    if (!partner) {
      return NextResponse.json(
        { error: "A reciprocal partner connection is required" },
        { status: 403 },
      );
    }

    const ownerId = await sanityClient.fetch<string | null>(
      `*[
        _type == "user" &&
        _id == $partnerId &&
        count(messages[
          _key == $key &&
          isShown == true &&
          shownBy._ref == $userId
        ]) > 0
      ][0]._id`,
      { key: messageKey, partnerId: partner._id, userId: session.user.id },
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
      { status: 500 },
    );
  }
}
