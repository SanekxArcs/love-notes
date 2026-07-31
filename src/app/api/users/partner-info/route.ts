import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "next-sanity";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, 
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const query = `*[_type == "user" && partnerIdToSend == $partnerId][0] {
      name
    }`;

    const partnerData = await sanityClient.fetch(query, { partnerId });

    if (!partnerData) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ name: partnerData.name });
  } catch (error) {
    console.error("Error fetching partner information:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner information" },
      { status: 500 }
    );
  }
}
