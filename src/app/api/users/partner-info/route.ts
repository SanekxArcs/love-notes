import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "next-sanity";

// Create Sanity client for querying
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03", // Use current API version
  useCdn: false, // Don't use CDN for authentication queries
  token: process.env.SANITY_API_TOKEN, // Include token if needed for private datasets
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication using the auth() function
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get partnerId from query parameter
    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    // Query Sanity for the user with this partnerIdToSend
    const query = `*[_type == "user" && partnerIdToSend == $partnerId][0] {
      name
    }`;

    const partnerData = await sanityClient.fetch(query, { partnerId });

    if (!partnerData) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Return only the necessary information
    return NextResponse.json({ name: partnerData.name });
  } catch (error) {
    console.error("Error fetching partner information:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner information" },
      { status: 500 }
    );
  }
}
