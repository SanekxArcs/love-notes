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
      const note = await sanityClient.fetch<{
        perspective?: string;
      } | null>(
        `*[_type == "user" && _id == $userId][0].partnerNotes[_key == $key][0]{ perspective }`,
        { userId: session.user.id, key },
      );
      if (!note) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      const nextShared = note.perspective === "self" ? true : isShared;
      await sanityClient
        .patch(session.user.id)
        .set({ [`partnerNotes[_key=="${key}"].isShared`]: nextShared })
        .commit();

      return NextResponse.json({ key, isShared: nextShared }, { status: 200 });
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        "keys": partnerNotes[!defined(perspective) || perspective == "partner"]._key
      }`,
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
