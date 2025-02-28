import { sanityClient } from "@/lib/sanity";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if the user is authenticated and has admin role
    if (!session || !session.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dailyMessageLimit, contactNumber } = await request.json();

    // Find the settings document ID first (if you don't have a fixed ID)
    const settings = await sanityClient.fetch(`*[_type == "settings"][0]._id`);

    if (!settings) {
      // If no settings document exists, create one
      const result = await sanityClient.create({
        _type: "settings",
        dailyMessageLimit,
        contactNumber,
      });

      return NextResponse.json({ success: true, data: result });
    } else {
      // Update existing settings
      const result = await sanityClient
        .patch(settings)
        .set({
          dailyMessageLimit,
          contactNumber,
        })
        .commit();

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}