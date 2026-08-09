import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getValidatedGeminiApiKey } from "@/lib/gemini";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const keyResult = await getValidatedGeminiApiKey(session.user.id);

    return NextResponse.json({
      hasKey: keyResult.ok,
      source: keyResult.ok ? keyResult.source : null,
    });
  } catch (error) {
    console.error("Error checking Gemini API key:", error);
    return NextResponse.json(
      { error: "Failed to check Gemini API key" },
      { status: 500 }
    );
  }
}
