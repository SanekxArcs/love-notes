import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

interface LikeRequestBody {
  messageId: string;
  liked: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, liked } = await request.json() as LikeRequestBody;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    await sanityClient
      .patch(messageId)
      .set({ like: liked })
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
