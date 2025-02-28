import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, liked } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    console.log(`Updating message ${messageId} like status to ${liked}`);

    // Update the like status directly in the message document
    const updatedDoc = await sanityClient
      .patch(messageId)
      .set({ like: liked })
      .commit();

    console.log("Updated document:", updatedDoc);

    return NextResponse.json({ success: true, liked, updatedDoc });
  } catch (error) {
    console.error("Error updating like status:", error);
    return NextResponse.json(
      { error: "Failed to update like status", details: error.message },
      { status: 500 }
    );
  }
}
