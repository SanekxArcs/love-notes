import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { arrayKey, sanityClient } from "@/lib/sanity";

const EVENT_PROJECTION = `{
  _key,
  type,
  title,
  date,
  time,
  durationMinutes,
  isRecurringYearly,
  mood,
  note,
  activities,
  initiatedBy,
  selfFinished,
  partnerFinished,
  protectionUsed,
  protectionType,
  rating,
  highlights,
  createdAt
}`;

const EVENT_FIELDS = [
  "type",
  "title",
  "date",
  "time",
  "durationMinutes",
  "isRecurringYearly",
  "mood",
  "note",
  "activities",
  "initiatedBy",
  "selfFinished",
  "partnerFinished",
  "protectionUsed",
  "protectionType",
  "rating",
  "highlights",
] as const;

type EventBody = Partial<Record<(typeof EVENT_FIELDS)[number], unknown>>;

function normalizeField(field: (typeof EVENT_FIELDS)[number], value: unknown) {
  switch (field) {
    case "durationMinutes":
    case "rating":
      return typeof value === "number" ? value : undefined;
    case "isRecurringYearly":
    case "protectionUsed":
      return Boolean(value);
    case "selfFinished":
    case "partnerFinished":
      return typeof value === "boolean" ? value : undefined;
    case "activities":
    case "highlights":
      return Array.isArray(value) ? value : undefined;
    default:
      return value || undefined;
  }
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

    const partnerId = session.user.partnerIdToReceiveFrom;

    const users = await sanityClient.fetch(
      `*[_type == "user" && (_id == $myId || (defined($partnerId) && partnerIdToSend == $partnerId))]{
        _id,
        name,
        "calendarEvents": calendarEvents[] ${EVENT_PROJECTION},
        "shownMessages": messages[isShown == true && defined(shownAt)]{
          _key,
          text,
          shownAt
        }
      }`,
      { myId: session.user.id, partnerId: partnerId || null }
    );

    const events = (users ?? []).flatMap(
      (user: {
        _id: string;
        name?: string;
        calendarEvents?: Record<string, unknown>[];
        shownMessages?: { _key: string; text: string; shownAt: string }[];
      }) => {
        const isMine = user._id === session.user.id;

        const calendarEvents = (user.calendarEvents ?? []).map((event) => ({
          ...event,
          ownerId: user._id,
          ownerName: user.name,
          isMine,
        }));

        // Only surface messages the partner sent and I've seen — not my own,
        // since this is meant as "history of getting messages from partner".
        const messageEvents = isMine
          ? []
          : (user.shownMessages ?? []).map((message) => ({
              _key: `msg-${message._key}`,
              type: "message" as const,
              date: message.shownAt.slice(0, 10),
              note: message.text,
              ownerId: user._id,
              ownerName: user.name,
              isMine: false,
            }));

        return [...calendarEvents, ...messageEvents];
      }
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
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

    const body: EventBody = await request.json();

    if (!body.type || !body.date) {
      return NextResponse.json(
        { error: "Event type and date are required" },
        { status: 400 }
      );
    }

    const newEvent: Record<string, unknown> = {
      _type: "calendarEvent" as const,
      _key: arrayKey(),
      date: body.date,
      createdAt: new Date().toISOString(),
    };

    for (const field of EVENT_FIELDS) {
      newEvent[field] = normalizeField(field, body[field]);
    }

    await sanityClient
      .patch(session.user.id)
      .setIfMissing({ calendarEvents: [] })
      .append("calendarEvents", [newEvent])
      .commit();

    return NextResponse.json(
      {
        event: {
          ...newEvent,
          ownerId: session.user.id,
          ownerName: session.user.name,
          isMine: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
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
        { error: "Event key is required" },
        { status: 400 }
      );
    }

    const body: EventBody = await request.json();

    if (!body.type || !body.date) {
      return NextResponse.json(
        { error: "Event type and date are required" },
        { status: 400 }
      );
    }

    const updatedFields: Record<string, unknown> = { date: body.date };
    for (const field of EVENT_FIELDS) {
      const value = normalizeField(field, body[field]);
      updatedFields[field] = value === undefined ? null : value;
    }

    const setPatch: Record<string, unknown> = {
      [`calendarEvents[_key=="${key}"].date`]: body.date,
    };
    const unsetPaths: string[] = [];

    for (const [field, value] of Object.entries(updatedFields)) {
      if (field === "date") continue;
      const path = `calendarEvents[_key=="${key}"].${field}`;
      if (value === null) {
        unsetPaths.push(path);
      } else {
        setPatch[path] = value;
      }
    }

    let patch = sanityClient.patch(session.user.id).set(setPatch);
    if (unsetPaths.length > 0) {
      patch = patch.unset(unsetPaths);
    }

    await patch.commit();

    return NextResponse.json(
      { event: { _key: key, ...updatedFields } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
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
        { error: "Event key is required" },
        { status: 400 }
      );
    }

    await sanityClient
      .patch(session.user.id)
      .unset([`calendarEvents[_key=="${key}"]`])
      .commit();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
