import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch daily message count for today
    const todayMessages = await sanityClient.fetch(`
      *[_type == "userMessageHistory" && 
        userId == $userId && 
        dateTime(lastShownAt) >= dateTime($today)
      ]
    `, { userId, today: today.toISOString() });

    const todayCount = todayMessages.length;
    
    // Determine category based on today's count - first message is daily, rest are extra
    const category = todayCount === 0 ? "daily" : "extra";

    console.log(`User ${userId} has ${todayCount} messages today. This will be a ${category} message.`);

    // Get messages that haven't been shown to this user yet
    const unseenMessages = await sanityClient.fetch(`
      *[_type == "message" && !(_id in *[_type == "userMessageHistory" && userId == $userId].messageId._ref)]
    `, { userId });

    // Select a random message from JavaScript
    let selectedMessage;
    
    if (unseenMessages && unseenMessages.length > 0) {
      // Get a random message from the unseen ones
      const randomIndex = Math.floor(Math.random() * unseenMessages.length);
      selectedMessage = unseenMessages[randomIndex];
    } else {
      // If no unshown messages, get any random message
      const allMessages = await sanityClient.fetch(`*[_type == "message"]`);
      
      if (allMessages && allMessages.length > 0) {
        const randomIndex = Math.floor(Math.random() * allMessages.length);
        selectedMessage = allMessages[randomIndex];
      }
    }

    if (selectedMessage) {
      // Create user message history record with proper category
      const historyRecord = await sanityClient.create({
        _type: "userMessageHistory",
        userId,
        messageId: {
          _type: "reference",
          _ref: selectedMessage._id
        },
        text: selectedMessage.text,
        category,  // This will be "daily" for first message, "extra" for others
        isShown: true,
        like: false,
        lastShownAt: new Date().toISOString()
      });

      // Update message to mark as shown
      await sanityClient
        .patch(selectedMessage._id)
        .set({
          isShown: true,
          lastShownAt: new Date().toISOString()
        })
        .commit();

      return NextResponse.json({
        message: {
          _id: historyRecord._id, // Use history ID for tracking likes
          text: selectedMessage.text,
          category,
          like: false,
          lastShownAt: new Date().toISOString(),
          isToday: true,
        }
      });
    }

    return NextResponse.json({ error: "No messages available" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching random message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message", details: error.message },
      { status: 500 }
    );
  }
}
