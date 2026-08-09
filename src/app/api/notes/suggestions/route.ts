import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { ONBOARDING_QUESTIONS } from "@/app/(dashboard)/notes/data/onboarding-questions";

interface SourceNote {
  _key: string;
  title: string;
  tags?: string[];
  onboardingQuestionId?: string;
  createdAt?: string;
}

interface OwnNote {
  title: string;
  onboardingQuestionId?: string;
  mirroredFromNoteKey?: string;
  perspective?: string;
}

function normalized(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("uk") ?? "";
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const partnerId = session.user.partnerIdToReceiveFrom;
    if (!partnerId) return NextResponse.json({ suggestions: [] });

    const [me, partner] = await Promise.all([
      sanityClient.fetch<{
        notes?: OwnNote[];
        dismissedKeys?: string[];
      }>(
        `*[_type == "user" && _id == $userId][0]{
          "notes": partnerNotes[]{ title, onboardingQuestionId, mirroredFromNoteKey, perspective },
          "dismissedKeys": dismissedNoteSuggestionKeys
        }`,
        { userId: session.user.id },
      ),
      sanityClient.fetch<{ name?: string; notes?: SourceNote[] } | null>(
        `*[_type == "user" && partnerIdToSend == $partnerId][0]{
          name,
          "notes": partnerNotes[isShared != true && (!defined(perspective) || perspective == "partner")]{
            _key,
            title,
            tags,
            onboardingQuestionId,
            createdAt
          }
        }`,
        { partnerId },
      ),
    ]);

    if (!partner) return NextResponse.json({ suggestions: [] });

    const ownNotes = (me?.notes ?? []).filter(
      (note) => note.perspective !== "self",
    );
    const dismissed = new Set(me?.dismissedKeys ?? []);
    const questionById = new Map(
      ONBOARDING_QUESTIONS.map((question) => [question.id, question]),
    );

    const suggestions = (partner.notes ?? [])
      .filter((source) => {
        if (dismissed.has(source._key)) return false;
        return !ownNotes.some(
          (note) =>
            note.mirroredFromNoteKey === source._key ||
            (source.onboardingQuestionId &&
              note.onboardingQuestionId === source.onboardingQuestionId) ||
            normalized(note.title) === normalized(source.title),
        );
      })
      .map((source) => {
        const onboardingQuestion = source.onboardingQuestionId
          ? questionById.get(source.onboardingQuestionId)
          : undefined;

        return {
          key: source._key,
          title: onboardingQuestion?.category ?? source.title,
          question:
            onboardingQuestion?.question ??
            `Що варто знати про тему «${source.title}» у твого партнера?`,
          tags: onboardingQuestion
            ? [onboardingQuestion.tagHint]
            : (source.tags ?? []).slice(0, 3),
          onboardingQuestionId: source.onboardingQuestionId,
          createdAt: source.createdAt,
          partnerName: partner.name ?? "Партнер",
        };
      })
      .sort((left, right) =>
        (right.createdAt ?? "").localeCompare(left.createdAt ?? ""),
      );

    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error fetching note suggestions:", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити пропозиції нотаток" },
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
    const suggestionKey =
      typeof body?.suggestionKey === "string" ? body.suggestionKey.trim() : "";

    if (!suggestionKey) {
      return NextResponse.json(
        { error: "Suggestion key is required" },
        { status: 400 },
      );
    }

    const dismissed = await sanityClient.fetch<string[] | null>(
      `*[_type == "user" && _id == $userId][0].dismissedNoteSuggestionKeys`,
      { userId: session.user.id },
    );

    if (!dismissed?.includes(suggestionKey)) {
      await sanityClient
        .patch(session.user.id)
        .setIfMissing({ dismissedNoteSuggestionKeys: [] })
        .append("dismissedNoteSuggestionKeys", [suggestionKey])
        .commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing note suggestion:", error);
    return NextResponse.json(
      { error: "Не вдалося приховати пропозицію" },
      { status: 500 },
    );
  }
}
