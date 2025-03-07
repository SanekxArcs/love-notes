import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

// GET endpoint to fetch a random unshown message
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

    // Find the partner user by their partnerIdToSend
    const partner = await sanityClient.fetch(
      `*[_type == "user" && partnerIdToSend == $partnerId][0]._id`,
      { partnerId }
    );
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found for the provided ID' }, { status: 404 });
    }
    
    // Get user's login to set as userName in the message
    const login = session.user.login;

    // Find a random unshown message created by the partner
    // Prioritize 'daily' category if available
    const dailyMessage = await sanityClient.fetch(
      `*[
        _type == "message" && 
        isShown == false && 
        creator._ref == $partnerId && 
        category == "daily"
      ][0]`,
      { partnerId: partner }
    );
    
    // If no daily message is available, try to get any unshown message
    const randomMessage = dailyMessage || await sanityClient.fetch(
      `*[
        _type == "message" && 
        isShown == false && 
        creator._ref == $partnerId
      ][0]`,
      { partnerId: partner }
    );
    
    if (!randomMessage) {
      // Specific error message for no unshown messages
      return NextResponse.json(
        { error: 'No unshown messages available from partner' }, 
        { status: 404 }
      );
    }

    // Get today's message count to determine if this is the first message (daily) or an extra message
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessageCount = await sanityClient.fetch(
      `count(*[
        _type == "userMessageHistory" && 
        userId == $userId &&
        shownAt >= $todayStart && 
        shownAt <= $todayEnd
      ])`,
      {
        userId: session.user.id,
        todayStart: today.toISOString(),
        todayEnd: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
      }
    );

    // Determine message type - first message is daily, others are extra
    const messageType = todayMessageCount === 0 ? "daily" : "extra";
    
    // Update the message as shown with timestamp and user info
    const now = new Date().toISOString();
    await sanityClient
      .patch(randomMessage._id)
      .set({
        isShown: true, // Been Shown = true
        shownAt: now,
        lastShownAt: now,
        shownBy: {
          _type: "reference",
          _ref: session.user.id
        },
        userName: session.user.name || login, // User Name who saw the message
        messageType: messageType // Daily or Extra based on count
      })
      .commit();

    // Create history record
    await sanityClient.create({
      _type: "userMessageHistory",
      userId: session.user.id,
      messageId: {
        _ref: randomMessage._id,
        _type: "reference"
      },
      shownAt: now,
      isExtraMessage: messageType === "extra",
      userName: session.user.name || login
    });
    
    // Return the message with updated info
    return NextResponse.json({
      message: {
        ...randomMessage,
        shownAt: now,
        messageType: messageType
      }
    });
  } catch (error) {
    console.error('Error fetching random message:', error);
    return NextResponse.json({ error: 'Failed to fetch random message' }, { status: 500 });
  }
}
