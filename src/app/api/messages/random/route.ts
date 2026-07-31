import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
    const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const partner = await sanityClient.fetch(
      `*[_type == "user" && partnerIdToSend == $partnerId][0]{
        _id,
        "dateMessages": messages[isShown == false && specificDate == $todayMD],
        "dailyMessage": messages[isShown == false && category == "daily"][0],
        "anyMessage": messages[isShown == false][0],
        "todayShownCount": count(messages[
          isShown == true &&
          shownBy._ref == $userId &&
          shownAt >= $todayStart &&
          shownAt <= $todayEnd
        ])
      }`,
      { partnerId, userId: session.user.id, todayStart, todayEnd, todayMD }
    );

    if (!partner?._id) {
      return NextResponse.json({ error: 'Partner not found for the provided ID' }, { status: 404 });
    }

    const dateMessages: Array<{ _key: string }> = partner.dateMessages ?? [];
    const priorityMessage = dateMessages.length
      ? dateMessages[Math.floor(Math.random() * dateMessages.length)]
      : null;

    const randomMessage = priorityMessage || partner.dailyMessage || partner.anyMessage;

    if (!randomMessage) {
      return NextResponse.json(
        { error: 'No unshown messages available from partner' },
        { status: 404 }
      );
    }

    const login = session.user.login;
    const messageType = partner.todayShownCount === 0 ? "daily" : "extra";
    const now = new Date().toISOString();

    await sanityClient
      .patch(partner._id)
      .set({
        [`messages[_key=="${randomMessage._key}"].isShown`]: true,
        [`messages[_key=="${randomMessage._key}"].shownAt`]: now,
        [`messages[_key=="${randomMessage._key}"].userName`]: session.user.name || login,
        [`messages[_key=="${randomMessage._key}"].category`]: messageType,
        [`messages[_key=="${randomMessage._key}"].shownBy`]: {
          _type: "reference",
          _ref: session.user.id,
        },
      })
      .commit();

    return NextResponse.json({
      message: {
        ...randomMessage,
        shownAt: now,
        category: messageType,
      },
    });
  } catch (error) {
    console.error('Error fetching random message:', error);
    return NextResponse.json({ error: 'Failed to fetch random message' }, { status: 500 });
  }
}
