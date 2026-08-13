import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";
import { getConnectedPartner } from "@/lib/user-access";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { partner } = await getConnectedPartner(userId);
    if (!partner) {
      return NextResponse.json(
        { error: "A reciprocal partner connection is required" },
        { status: 403 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await sanityClient.fetch(
      `*[_type == "user" && _id == $partnerId][0]{
        "todayMessages": messages[
          isShown == true &&
          shownBy._ref == $userId &&
          defined(shownAt) &&
          dateTime(shownAt) >= dateTime($today)
        ] | order(shownAt desc) {
          _key,
          text,
          category,
          like,
          shownAt,
          userName
        },
        "previousMessages": messages[
          isShown == true &&
          shownBy._ref == $userId &&
          defined(shownAt) &&
          dateTime(shownAt) < dateTime($today)
        ] | order(shownAt desc) {
          _key,
          text,
          category,
          like,
          shownAt,
          userName
        }
      }`,
      {
        partnerId: partner._id,
        userId,
        today: today.toISOString()
      }
    );

    if (!messages) {
      return NextResponse.json({ error: 'Partner not found for the provided ID' }, { status: 404 });
    }

    return NextResponse.json({
      todayMessages: messages.todayMessages ?? [],
      previousMessages: messages.previousMessages ?? [],
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return NextResponse.json({ error: 'Failed to fetch message history' }, { status: 500 });
  }
}
