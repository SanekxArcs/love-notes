import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { arrayKey, sanityClient } from "@/lib/sanity";

const MAX_CORRECTION_LENGTH = 1000;
const NOTE_KEY_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;
const CORRECTION_KEY_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const noteKey = typeof body?.noteKey === "string" ? body.noteKey.trim() : "";
    const text =
      typeof body?.text === "string"
        ? body.text.trim().slice(0, MAX_CORRECTION_LENGTH)
        : "";

    if (!NOTE_KEY_PATTERN.test(noteKey) || !text) {
      return NextResponse.json(
        { error: "Note key and correction text are required" },
        { status: 400 },
      );
    }

    const partnerId = session.user.partnerIdToReceiveFrom;
    if (!partnerId) {
      return NextResponse.json(
        { error: "Партнера не підключено" },
        { status: 400 },
      );
    }

    const partner = await sanityClient.fetch<{ _id: string } | null>(
      `*[
        _type == "user" &&
        partnerIdToSend == $partnerId &&
        count(partnerNotes[
          _key == $noteKey &&
          isShared == true &&
          (!defined(perspective) || perspective == "partner")
        ]) > 0
      ][0]{ _id }`,
      { partnerId, noteKey },
    );

    if (!partner) {
      return NextResponse.json(
        { error: "Спільну нотатку партнера не знайдено" },
        { status: 404 },
      );
    }

    const correction = {
      _type: "noteCorrection" as const,
      _key: arrayKey(),
      authorId: session.user.id,
      authorName: session.user.name?.trim() || "Партнер",
      text,
      createdAt: new Date().toISOString(),
    };
    const correctionsPath = `partnerNotes[_key=="${noteKey}"].corrections`;

    await sanityClient
      .patch(partner._id)
      .setIfMissing({ [correctionsPath]: [] })
      .append(correctionsPath, [correction])
      .commit();

    return NextResponse.json({ correction }, { status: 201 });
  } catch (error) {
    console.error("Error adding partner note correction:", error);
    return NextResponse.json(
      { error: "Не вдалося додати уточнення" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const noteKey = typeof body?.noteKey === "string" ? body.noteKey.trim() : "";
    const correctionKey =
      typeof body?.correctionKey === "string" ? body.correctionKey.trim() : "";

    if (
      !NOTE_KEY_PATTERN.test(noteKey) ||
      !CORRECTION_KEY_PATTERN.test(correctionKey)
    ) {
      return NextResponse.json(
        { error: "Note key and correction key are required" },
        { status: 400 },
      );
    }

    const partnerId = session.user.partnerIdToReceiveFrom;
    if (!partnerId) {
      return NextResponse.json(
        { error: "Партнера не підключено" },
        { status: 400 },
      );
    }

    const ownNoteOwner = await sanityClient.fetch<{ _id: string } | null>(
      `*[
        _type == "user" &&
        _id == $userId &&
        count(partnerNotes[
          _key == $noteKey &&
          count(corrections[_key == $correctionKey]) > 0
        ]) > 0
      ][0]{ _id }`,
      { userId: session.user.id, noteKey, correctionKey },
    );

    const correctionAuthorPartner = ownNoteOwner
      ? null
      : await sanityClient.fetch<{ _id: string } | null>(
      `*[
        _type == "user" &&
        partnerIdToSend == $partnerId &&
        count(partnerNotes[
          _key == $noteKey &&
          isShared == true &&
          count(corrections[_key == $correctionKey && authorId == $authorId]) > 0
        ]) > 0
      ][0]{ _id }`,
      {
        partnerId,
        noteKey,
        correctionKey,
        authorId: session.user.id,
      },
    );

    const noteOwner = ownNoteOwner ?? correctionAuthorPartner;
    if (!noteOwner) {
      return NextResponse.json(
        { error: "Уточнення не знайдено або воно недоступне" },
        { status: 404 },
      );
    }

    const correctionPath = `partnerNotes[_key=="${noteKey}"].corrections[_key=="${correctionKey}"]`;
    await sanityClient.patch(noteOwner._id).unset([correctionPath]).commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner note correction:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити уточнення" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const noteKey = typeof body?.noteKey === "string" ? body.noteKey.trim() : "";
    const correctionKey =
      typeof body?.correctionKey === "string" ? body.correctionKey.trim() : "";
    const mode = body?.mode;

    if (
      !NOTE_KEY_PATTERN.test(noteKey) ||
      !CORRECTION_KEY_PATTERN.test(correctionKey) ||
      (mode !== "append" && mode !== "replace")
    ) {
      return NextResponse.json(
        { error: "Некоректні дані для прийняття уточнення" },
        { status: 400 },
      );
    }

    const result = await sanityClient.fetch<{
      _id: string;
      note?: {
        description?: string;
        correction?: { text?: string };
      };
    } | null>(
      `*[_type == "user" && _id == $userId][0]{
        _id,
        "note": partnerNotes[_key == $noteKey][0]{
          description,
          "correction": corrections[_key == $correctionKey][0]{ text }
        }
      }`,
      { userId: session.user.id, noteKey, correctionKey },
    );

    const correctionText = result?.note?.correction?.text?.trim();
    if (!result || !correctionText) {
      return NextResponse.json(
        { error: "Уточнення не знайдено" },
        { status: 404 },
      );
    }

    const description =
      mode === "append"
        ? [result.note?.description?.trim(), correctionText]
            .filter(Boolean)
            .join("\n\n")
        : correctionText;
    const updatedAt = new Date().toISOString();
    const notePath = `partnerNotes[_key=="${noteKey}"]`;
    const correctionPath = `${notePath}.corrections[_key=="${correctionKey}"]`;

    await sanityClient
      .patch(result._id)
      .set({
        [`${notePath}.description`]: description,
        [`${notePath}.updatedAt`]: updatedAt,
      })
      .unset([correctionPath])
      .commit();

    return NextResponse.json({ note: { _key: noteKey, description, updatedAt } });
  } catch (error) {
    console.error("Error accepting partner note correction:", error);
    return NextResponse.json(
      { error: "Не вдалося прийняти уточнення" },
      { status: 500 },
    );
  }
}
