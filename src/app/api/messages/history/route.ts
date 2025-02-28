import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { auth } from "@/auth";

// Define Sanity message types
interface SanityMessage {
  _id: string;
  text: string;
  category: "daily" | "extra" | "unknown";
  like: boolean;
  shownAt: string;
  userName: string;
}

export async function GET() {
  try {
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const userName = session.user.name || session.user.email;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's messages
    const todayMessages = await sanityClient.fetch<SanityMessage[]>(`
      *[_type == "message" && 
        isShown == true && 
        dateTime(shownAt) >= dateTime($today)
      ] | order(shownAt desc) {
        _id,
        text,
        category,
        like,
        shownAt,
        userName
      }
    `, { today: today.toISOString() });

    // Filter messages for this user
    const userTodayMessages = todayMessages.filter(msg => 
      msg.userName === session.user?.name || msg.userName === session.user?.email
    );

    // Fetch previous messages (exclude today's)
    const previousMessages = await sanityClient.fetch<SanityMessage[]>(`
      *[_type == "message" && 
        isShown == true && 
        dateTime(shownAt) < dateTime($today)
      ] | order(shownAt desc)[0...20] {
        _id,
        text,
        category,
        like,
        shownAt,
        userName
      }
    `, { today: today.toISOString() });

    // Filter messages for this user
    const userPreviousMessages = previousMessages.filter(msg => 
      msg.userName === session.user?.name || msg.userName === session.user?.email
    );

    return NextResponse.json({
      todayMessages: userTodayMessages,
      previousMessages: userPreviousMessages
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching message history:", error);
    return NextResponse.json(
      { error: "Failed to fetch message history", details: errorMessage },
      { status: 500 }
    );
  }
}
