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

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{ geminiApiKey }`,
      { userId: session.user.id }
    );

    return NextResponse.json({ hasKey: Boolean(user?.geminiApiKey?.trim()) });
  } catch (error) {
    console.error("Error checking Gemini API key:", error);
    return NextResponse.json(
      { error: "Failed to check Gemini API key" },
      { status: 500 }
    );
  }
}
