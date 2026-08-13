import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";
import { verifyPassword } from "@/lib/password";

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        password,
        "unshownKeys": messages[isShown != true]._key
      }`,
      { userId }
    );

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    const unshownKeys: string[] = user.unshownKeys ?? [];

    if (unshownKeys.length === 0) {
      return NextResponse.json({
        message: "No unshown messages found to delete",
        count: 0
      }, { status: 200 });
    }

    await sanityClient
      .patch(userId)
      .unset(unshownKeys.map((key) => `messages[_key=="${key}"]`))
      .commit();

    return NextResponse.json({
      success: true,
      count: unshownKeys.length,
      message: `Successfully deleted ${unshownKeys.length} unshown messages`
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting unshown messages:", error);
    return NextResponse.json(
      { error: "Failed to delete unshown messages" },
      { status: 500 }
    );
  }
}
