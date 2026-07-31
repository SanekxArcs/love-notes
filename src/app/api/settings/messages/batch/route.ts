import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { arrayKey, sanityClient } from "@/lib/sanity";

interface BatchMessageRequestBody {
  messages: string[];
  category?: string;
  isShown?: boolean;
  like?: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { messages, category, isShown, like } =
      (await request.json()) as BatchMessageRequestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Message array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newMessages = messages.map((text) => ({
      _type: "message" as const,
      _key: arrayKey(),
      text,
      category: category || "unknown",
      isShown: isShown || false,
      like: like || false,
      shownAt: null,
      createdAt: now,
    }));

    await sanityClient
      .patch(session.user.id)
      .setIfMissing({ messages: [] })
      .append("messages", newMessages)
      .commit();

    return NextResponse.json(
      { messages: newMessages, count: newMessages.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating batch messages:", error);
    return NextResponse.json(
      { error: "Failed to create messages" },
      { status: 500 }
    );
  }
}
