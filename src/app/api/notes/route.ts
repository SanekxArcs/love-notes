import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { arrayKey, sanityClient } from "@/lib/sanity";

const CONFIDENCE_VALUES = new Set(["certain", "likely", "needs-check"]);
const PERSPECTIVE_VALUES = new Set(["partner", "self"]);

function normalizeConfidence(value: unknown) {
  return typeof value === "string" && CONFIDENCE_VALUES.has(value)
    ? value
    : "certain";
}

function normalizePerspective(value: unknown) {
  return typeof value === "string" && PERSPECTIVE_VALUES.has(value)
    ? value
    : "partner";
}

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
        "notes": partnerNotes | order(updatedAt desc, createdAt desc) {
          _key,
          title,
          description,
          tags,
          onboardingQuestionId,
          mirroredFromNoteKey,
          isShared,
          createdAt,
          updatedAt,
          confidence,
          perspective,
          corrections[]{ _key, authorId, authorName, text, createdAt }
        }
      }`,
      { userId: session.user.id }
    );

    return NextResponse.json({ notes: user?.notes ?? [] });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
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

    const { title, description, tags, onboardingQuestionId, mirroredFromNoteKey, confidence, perspective: rawPerspective } =
      await request.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const perspective = normalizePerspective(rawPerspective);
    const newNote = {
      _type: "partnerNote" as const,
      _key: arrayKey(),
      title: title.trim(),
      description: description.trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : undefined,
      onboardingQuestionId: onboardingQuestionId || undefined,
      mirroredFromNoteKey:
        typeof mirroredFromNoteKey === "string"
          ? mirroredFromNoteKey.trim() || undefined
          : undefined,
      perspective,
      isShared: perspective === "self",
      confidence: normalizeConfidence(confidence),
      createdAt: now,
      updatedAt: now,
    };

    await sanityClient
      .patch(session.user.id)
      .setIfMissing({ partnerNotes: [] })
      .append("partnerNotes", [newNote])
      .commit();

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
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
        { error: "Note key is required" },
        { status: 400 }
      );
    }

    const { title, description, tags, confidence, perspective: rawPerspective } = await request.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const perspective = normalizePerspective(rawPerspective);
    const updatedFields = {
      title: title.trim(),
      description: description.trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      confidence: normalizeConfidence(confidence),
      perspective,
      updatedAt: new Date().toISOString(),
    };

    const noteFields = {
        [`partnerNotes[_key=="${key}"].title`]: updatedFields.title,
        [`partnerNotes[_key=="${key}"].description`]: updatedFields.description,
        [`partnerNotes[_key=="${key}"].tags`]: updatedFields.tags,
        [`partnerNotes[_key=="${key}"].confidence`]: updatedFields.confidence,
        [`partnerNotes[_key=="${key}"].perspective`]: updatedFields.perspective,
        [`partnerNotes[_key=="${key}"].updatedAt`]: updatedFields.updatedAt,
        ...(perspective === "self"
          ? { [`partnerNotes[_key=="${key}"].isShared`]: true }
          : {}),
      };

    await sanityClient.patch(session.user.id).set(noteFields).commit();

    return NextResponse.json(
      { note: { _key: key, ...updatedFields, ...(perspective === "self" ? { isShared: true } : {}) } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
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
        { error: "Note key is required" },
        { status: 400 }
      );
    }

    await sanityClient
      .patch(session.user.id)
      .unset([`partnerNotes[_key=="${key}"]`])
      .commit();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
