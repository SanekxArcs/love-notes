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

    const partner = await sanityClient.fetch(
      `*[_type == "user" && partnerIdToSend == $partnerId][0]._id`,
      { partnerId }
    );
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found for the provided ID' }, { status: 404 });
    }
    
    const login = session.user.login;

    const dailyMessage = await sanityClient.fetch(
      `*[
        _type == "message" && 
        isShown == false && 
        creator._ref == $partnerId && 
        category == "daily"
      ][0]`,
      { partnerId: partner }
    );
    
    const randomMessage = dailyMessage || await sanityClient.fetch(
      `*[
        _type == "message" && 
        isShown == false && 
        creator._ref == $partnerId
      ][0]`,
      { partnerId: partner }
    );
    
    if (!randomMessage) {
      return NextResponse.json(
        { error: 'No unshown messages available from partner' }, 
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessageCount = await sanityClient.fetch(
      `count(*[
        _type == "message" && 
        creator._ref == $partnerId &&
        isShown == true &&
        shownBy._ref == $userId &&
        shownAt >= $todayStart && 
        shownAt <= $todayEnd
      ])`,
      {
        partnerId: partner,
        userId: session.user.id,
        todayStart: today.toISOString(),
        todayEnd: new Date(
          today.getTime() + 24 * 60 * 60 * 1000 - 1
        ).toISOString(),
      }
    );

    const messageType = todayMessageCount === 0 ? "daily" : "extra";
    
    const now = new Date().toISOString();
    await sanityClient
      .patch(randomMessage._id)
      .set({
        isShown: true,
        shownAt: now,
        userName: session.user.name || login,
        category: messageType,
        shownBy: {
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
