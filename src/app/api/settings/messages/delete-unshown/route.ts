import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";
import { verifyPassword } from "@/lib/password";
import { isValidArrayKey } from "@/lib/user-access";

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    const body = await request.json();
    const { password, keys } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const selectedKeys = keys === undefined ? undefined : keys;
    if (
      selectedKeys !== undefined &&
      (!Array.isArray(selectedKeys) ||
        selectedKeys.length === 0 ||
        selectedKeys.some((key) => !isValidArrayKey(key)))
    ) {
      return NextResponse.json({ error: "A non-empty message key list is required" }, { status: 400 });
    }

    const user = await sanityClient.fetch(
      selectedKeys
        ? `*[_type == "user" && _id == $userId][0]{
        password,
        "targetKeys": messages[isShown != true && _key in $selectedKeys]._key
      }`
        : `*[_type == "user" && _id == $userId][0]{
        password,
        "targetKeys": messages[isShown != true]._key
      }`,
      selectedKeys ? { userId, selectedKeys } : { userId },
    );

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    const targetKeys: string[] = user.targetKeys ?? [];

    if (targetKeys.length === 0) {
      return NextResponse.json({
        message: selectedKeys
          ? "No selected unshown messages found to delete"
          : "No unshown messages found to delete",
        count: 0
      }, { status: 200 });
    }

    await sanityClient
      .patch(userId)
      .unset(targetKeys.map((key) => `messages[_key=="${key}"]`))
      .commit();

    return NextResponse.json({
      success: true,
      count: targetKeys.length,
      message: `Successfully deleted ${targetKeys.length} messages`
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting unshown messages:", error);
    return NextResponse.json(
      { error: "Failed to delete unshown messages" },
      { status: 500 }
    );
  }
}
