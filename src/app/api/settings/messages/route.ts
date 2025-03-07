import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  try {
    const session = await auth();

    // Check if the user is authenticated and is an admin
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all messages
    const messages = await sanityClient.fetch(`
      *[_type == "message"] | order(_createdAt desc) {
        _id,
        text,
        category,
        isShown,
        userName,
        like,
        shownAt
      }
    `);

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

    // Check if the user is authenticated and is an admin
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, category } = await request.json();

    // Validate input
    if (!text || !category) {
      return NextResponse.json(
        { error: "Message text and category are required" },
        { status: 400 }
      );
    }

    // Create document in Sanity with creator reference from the current user
    const message = await sanityClient.create({
      _type: "message",
      text,
      category,
      isShown: false,
      like: false,
      lastShownAt: null,
      creator: {
        _type: "reference",
        _ref: session.user.id,
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
    const session = await auth();

    // Check if the user is authenticated and is an admin
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const { text, category, isShown, like } = await request.json();

    // Validate input
    if (!text || !category) {
      return NextResponse.json(
        { error: "Message text and category are required" },
        { status: 400 }
      );
    }

    // Update document in Sanity
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
