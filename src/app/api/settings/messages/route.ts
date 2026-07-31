import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { arrayKey, sanityClient } from "@/lib/sanity";

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
      `*[_type == "user" && _id == $userId][0]{
        "messages": messages | order(createdAt desc) {
          _key,
          text,
          category,
          isShown,
          userName,
          like,
          shownAt,
          createdAt
        }
      }`,
      { userId: session.user.id }
    );

    return NextResponse.json({ messages: user?.messages ?? [] });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
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

    const { text, category } = await request.json();

    if (!text || !category) {
      return NextResponse.json(
        { error: "Message text and category are required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const newMessage = {
      _type: "message" as const,
      _key: arrayKey(),
      text,
      category,
      isShown: false,
      like: false,
      shownAt: null,
      createdAt: new Date().toISOString(),
    };

    await sanityClient
      .patch(userId)
      .setIfMissing({ messages: [] })
      .append("messages", [newMessage])
      .commit();

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Message key is required" },
        { status: 400 }
      );
    }

    await sanityClient
      .patch(session.user.id)
      .unset([`messages[_key=="${key}"]`])
      .commit();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Message key is required" },
        { status: 400 }
      );
    }

    const { text, category, isShown, like } = await request.json();

    if (!text || !category) {
      return NextResponse.json(
        { error: "Message text and category are required" },
        { status: 400 }
      );
    }

    const updatedFields = {
      text,
      category,
      isShown: isShown || false,
      like: like || false,
    };

    await sanityClient
      .patch(session.user.id)
      .set({
        [`messages[_key=="${key}"].text`]: updatedFields.text,
        [`messages[_key=="${key}"].category`]: updatedFields.category,
        [`messages[_key=="${key}"].isShown`]: updatedFields.isShown,
        [`messages[_key=="${key}"].like`]: updatedFields.like,
      })
      .commit();

    return NextResponse.json(
      { message: { _key: key, ...updatedFields } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
