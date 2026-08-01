import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

// PATCH ?key=<note key>  { isShared } -> toggle a single note
// PATCH (no key)         { isShared } -> apply to every note at once
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { isShared } = await request.json();

    if (typeof isShared !== "boolean") {
      return NextResponse.json(
        { error: "isShared (boolean) is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      await sanityClient
        .patch(session.user.id)
        .set({ [`partnerNotes[_key=="${key}"].isShared`]: isShared })
        .commit();

      return NextResponse.json({ key, isShared }, { status: 200 });
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{ "keys": partnerNotes[]._key }`,
      { userId: session.user.id }
    );
    const keys: string[] = user?.keys ?? [];

    if (keys.length > 0) {
      const setPatch = Object.fromEntries(
        keys.map((noteKey) => [`partnerNotes[_key=="${noteKey}"].isShared`, isShared])
      );
      await sanityClient.patch(session.user.id).set(setPatch).commit();
    }

    return NextResponse.json({ keys, isShared }, { status: 200 });
  } catch (error) {
    console.error("Error updating note share status:", error);
    return NextResponse.json(
      { error: "Failed to update note share status" },
      { status: 500 }
    );
  }
}
