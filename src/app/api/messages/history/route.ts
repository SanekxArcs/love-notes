import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get partnerId from query parameters
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await sanityClient.fetch(
      `*[_type == "user" && partnerIdToSend == $partnerId][0]{
        "todayMessages": messages[
          isShown == true &&
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
        partnerId,
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
