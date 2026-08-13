import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

interface DashboardData {
  user: {
    name?: string;
    phone?: string;
    partnerIdToSend?: string;
    partnerIdToReceiveFrom?: string;
  } | null;
  partner: {
    phone?: string;
    dayMessageLimit?: number;
    todayMessages?: unknown[];
    previousMessages?: unknown[];
  } | null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await sanityClient.fetch<DashboardData>(
      `{
        "user": *[_type == "user" && _id == $userId][0]{
          name, phone, partnerIdToSend, partnerIdToReceiveFrom
        },
        "partner": *[
          _type == "user" &&
          partnerIdToSend == *[_type == "user" && _id == $userId][0].partnerIdToReceiveFrom &&
          partnerIdToReceiveFrom == *[_type == "user" && _id == $userId][0].partnerIdToSend
        ][0]{
          phone,
          dayMessageLimit,
          "todayMessages": messages[
            isShown == true &&
            shownBy._ref == $userId &&
            defined(shownAt) &&
            dateTime(shownAt) >= dateTime($today)
          ] | order(shownAt desc) {
            _key, text, category, like, shownAt, userName
          },
          "previousMessages": messages[
            isShown == true &&
            shownBy._ref == $userId &&
            defined(shownAt) &&
            dateTime(shownAt) < dateTime($today)
          ] | order(shownAt desc) {
            _key, text, category, like, shownAt, userName
          }
        }
      }`,
      { userId, today: today.toISOString() },
    );

    if (!data.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      settings: {
        dailyMessageLimit: data.partner?.dayMessageLimit ?? 0,
        contactNumber: data.partner?.phone ?? data.user.phone ?? "",
        partnerIdToReceiveFrom: data.partner
          ? data.user.partnerIdToReceiveFrom ?? ""
          : "",
        partnerIdToSend: data.user.partnerIdToSend ?? "",
        userName: data.user.name ?? "",
      },
      todayMessages: data.partner?.todayMessages ?? [],
      previousMessages: data.partner?.previousMessages ?? [],
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
