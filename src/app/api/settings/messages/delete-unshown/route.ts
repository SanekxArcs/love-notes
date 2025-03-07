import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

interface SanityMessage {
  _id: string;
  _type: string;
  isShown?: boolean;
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body to get the password
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Fetch the admin user to compare passwords
    const userId = session.user.id;
    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        password
      }`,
      { userId }
    );

    // Validate against the user's actual password
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    // Find all unshown messages
    const query = `*[_type == "message" && isShown != true]`;
    const unshownMessages = await sanityClient.fetch(query);

    if (!unshownMessages || unshownMessages.length === 0) {
      return NextResponse.json({ 
        message: "No unshown messages found to delete", 
        count: 0 
      }, { status: 200 });
    }

    // Delete all unshown messages
    const transaction = sanityClient.transaction();
    unshownMessages.forEach((message: SanityMessage) => {
      transaction.delete(message._id);
    });

    await transaction.commit();

    return NextResponse.json({ 
      success: true, 
      count: unshownMessages.length,
      message: `Successfully deleted ${unshownMessages.length} unshown messages` 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting unshown messages:", error);
    return NextResponse.json(
      { error: "Failed to delete unshown messages" },
      { status: 500 }
    );
  }
}
