import { sanityClient } from "@/lib/sanity";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

interface SettingsData {
  _id?: string;
  dailyMessageLimit: number;
  contactNumber: string;
}

export async function GET() {
  try {
    // Fetch settings from Sanity
    const settings = await sanityClient.fetch<SettingsData | null>(`*[_type == "settings"][0]{
      dailyMessageLimit,
      contactNumber
    }`);

    // If no settings found, return default values
    if (!settings) {
      return NextResponse.json({
        dailyMessageLimit: 3,
        contactNumber: "+380123456789"
      });
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch settings", 
        details: errorMessage,
        // Return default values in case of error
        dailyMessageLimit: 3,
        contactNumber: "+380123456789"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if the user is authenticated and has admin role
    if (!session || !session.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dailyMessageLimit, contactNumber } = await request.json() as SettingsData;

    // Find the settings document ID first
    const settingsDoc = await sanityClient.fetch<SettingsData | null>(`*[_type == "settings"][0]`);

    if (!settingsDoc) {
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
        .patch(settingsDoc._id!)
        .set({
          dailyMessageLimit,
          contactNumber,
        })
        .commit();

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: errorMessage },
      { status: 500 }
    );
  }
}