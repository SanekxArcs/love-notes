import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

const STEPS = new Set(["messages", "calendar", "notes", "dashboard"]);

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const step = new URL(request.url).searchParams.get("step");
  const user = await sanityClient.fetch<{
    onboardingProfileCompleted?: boolean;
    onboardingSeenSteps?: string[];
  } | null>(
    `*[_type == "user" && _id == $userId][0]{ onboardingProfileCompleted, onboardingSeenSteps }`,
    { userId: session.user.id },
  );

  const isNewUser = typeof user?.onboardingProfileCompleted === "boolean";
  const show = step === "profile"
    ? user?.onboardingProfileCompleted === false
    : isNewUser && user?.onboardingProfileCompleted === true && Boolean(step && !user.onboardingSeenSteps?.includes(step));
  return NextResponse.json({ show });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  if (body.action === "complete-profile") {
    await sanityClient.patch(session.user.id).set({ onboardingProfileCompleted: true }).commit();
    return NextResponse.json({ success: true });
  }

  const step = typeof body.step === "string" ? body.step : "";
  if (body.action !== "complete-step" || !STEPS.has(step)) {
    return NextResponse.json({ error: "Invalid onboarding step" }, { status: 400 });
  }

  const seen = await sanityClient.fetch<string[] | null>(
    `*[_type == "user" && _id == $userId][0].onboardingSeenSteps`,
    { userId: session.user.id },
  );
  if (!seen?.includes(step)) {
    await sanityClient.patch(session.user.id).setIfMissing({ onboardingSeenSteps: [] }).append("onboardingSeenSteps", [step]).commit();
  }
  return NextResponse.json({ success: true });
}
