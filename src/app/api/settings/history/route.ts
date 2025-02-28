import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  try {
    const session = await auth();

    // Check if the user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user message history
    const history = await sanityClient.fetch(`
      *[_type == "userMessageHistory"] | order(lastShownAt desc)[0...50] {
        _id,
        userId,
        messageId->{
          _id,
          text,
          category,
          like
        },
        lastShownAt,
        like
      }
    `);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching message history:", error);
    return NextResponse.json(
      { error: "Failed to fetch message history" },
      { status: 500 }
    );
  }
}
