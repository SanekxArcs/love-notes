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

    const messages = await sanityClient.fetch(`
      *[_type == "message" && creator._ref == $userId] | order(_createdAt desc) {
        _id,
        text,
        category,
        isShown,
        userName,
        like,
        shownAt
      }
    `, {
      userId: session.user.id
    });

    return NextResponse.json({ messages });
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

    const { text, category } = await request.json();

    if (!text || !category) {
      return NextResponse.json(
        { error: "Message text and category are required" },
        { status: 400 }
      );
    }

    const message = await sanityClient.create({
      _type: "message",
      text,
      category,
      isShown: false,
      like: false,
      shownAt: null,
      creator: {
        _type: "reference",
        _ref: session?.user.id,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    await sanityClient.delete(id);

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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
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

    const message = await sanityClient
      .patch(id)
      .set({
        text,
        category,
        isShown: isShown || false,
        like: like || false,
      })
      .commit();

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
