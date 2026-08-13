import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";
import { getConnectedPartner, isValidArrayKey } from "@/lib/user-access";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { user, partner: connectedPartner } = await getConnectedPartner(
      userId,
    );
    if (!user || !connectedPartner) {
      return NextResponse.json(
        { error: "A reciprocal partner connection is required" },
        { status: 403 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
    const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const partner = await sanityClient.fetch(
      `*[_type == "user" && _id == $partnerId][0]{
        _id,
        _rev,
        dayMessageLimit,
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
      {
        partnerId: connectedPartner._id,
        userId,
        todayStart,
        todayEnd,
        todayMD,
      }
    );

    if (!partner?._id) {
      return NextResponse.json({ error: 'Partner not found for the provided ID' }, { status: 404 });
    }

    const dailyLimit = partner.dayMessageLimit ?? 1;
    const todayShownCount = partner.todayShownCount ?? 0;

    if (todayShownCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: 'Daily message limit reached',
          code: 'DAILY_LIMIT_REACHED',
          todayShownCount,
          dailyLimit,
        },
        { status: 429 },
      );
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

    if (!isValidArrayKey(randomMessage._key)) {
      console.error("Invalid message key returned by Sanity");
      return NextResponse.json({ error: "Invalid message state" }, { status: 500 });
    }

    const login = user.login;
    const messageType = todayShownCount === 0 ? "daily" : "extra";
    const now = new Date().toISOString();

    await sanityClient
      .patch(partner._id)
      .ifRevisionId(partner._rev)
      .set({
        [`messages[_key=="${randomMessage._key}"].isShown`]: true,
        [`messages[_key=="${randomMessage._key}"].shownAt`]: now,
        [`messages[_key=="${randomMessage._key}"].userName`]: user.name || login,
        [`messages[_key=="${randomMessage._key}"].category`]: messageType,
        [`messages[_key=="${randomMessage._key}"].shownBy`]: {
          _type: "reference",
          _ref: userId,
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
    if (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 409) {
      return NextResponse.json(
        { error: 'Message state changed. Please refresh and try again.' },
        { status: 409 },
      );
    }

    console.error('Error fetching random message:', error);
    return NextResponse.json({ error: 'Failed to fetch random message' }, { status: 500 });
  }
}
