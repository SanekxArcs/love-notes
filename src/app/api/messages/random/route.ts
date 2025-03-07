import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

// Define Sanity message types
interface SanityMessage {
  _id: string;
  text: string;
  category?: "daily" | "extra" | "unknown";
  like?: boolean;
  shownAt?: string;
  userName?: string;
  isShown?: boolean;
}

export async function GET() {
  try {
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userName = session.user.name || session.user.phone;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch messages shown to this user today
    const todayMessages = await sanityClient.fetch<SanityMessage[]>(`
      *[_type == "message" && 
        userName == $userName && 
        dateTime(shownAt) >= dateTime($today)
      ]
    `, { userName, today: today.toISOString() });

    const todayCount = todayMessages.length;
    
    // Determine category based on today's count - first message is daily, rest are extra
    const category = todayCount === 0 ? "daily" : "extra";

    console.log(`User ${userName} has ${todayCount} messages today. This will be a ${category} message.`);

    // Get messages that haven't been shown yet
    const unseenMessages = await sanityClient.fetch<SanityMessage[]>(`
      *[_type == "message" && isShown == false]
    `);

    // Select a random message from JavaScript
    let selectedMessage: SanityMessage | undefined;
    
    if (unseenMessages && unseenMessages.length > 0) {
      // Get a random message from the unseen ones
      const randomIndex = Math.floor(Math.random() * unseenMessages.length);
      selectedMessage = unseenMessages[randomIndex];
    } else {
      // If no unshown messages, get any random message
      const allMessages = await sanityClient.fetch<SanityMessage[]>(`*[_type == "message"]`);
      
      if (allMessages && allMessages.length > 0) {
        const randomIndex = Math.floor(Math.random() * allMessages.length);
        selectedMessage = allMessages[randomIndex];
      }
    }

    if (selectedMessage) {
      const currentTime = new Date().toISOString();

      // Update message to mark as shown and associate with this user
      const updatedMessage = await sanityClient
        .patch(selectedMessage._id)
        .set({
          isShown: true,
          shownAt: currentTime,
          userName: userName,
          category: category // Set the category based on today's count
        })
        .commit();

      return NextResponse.json({
        message: {
          _id: updatedMessage._id,
          text: updatedMessage.text,
          category,
          like: false,
          shownAt: currentTime,
          isToday: true,
        }
      });
    }

    return NextResponse.json({ error: "No messages available" }, { status: 404 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching random message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message", details: errorMessage },
      { status: 500 }
    );
  }
}
