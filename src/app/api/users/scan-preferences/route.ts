import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await sanityClient.fetch(
    `*[_type == "user" && _id == $userId][0]{ localScanLanguage }`,
    { userId: session.user.id }
  );

  return NextResponse.json({
    localScanLanguage: user?.localScanLanguage || "uk",
  });
}
