import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUserAndRelatedData } from "@/lib/delete-user";
import { SCAN_LANGUAGES } from "@/lib/languages";
import {
  hashPassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
  verifyPassword,
} from "@/lib/password";
import { sanityClient } from "@/lib/sanity";
import {
  connectPartner,
  disconnectPartner,
  rotateOutgoingPartnerId,
} from "@/lib/user-access";

const SCAN_LANGUAGE_CODES = new Set<string>(
  SCAN_LANGUAGES.map((item) => item.code),
);

type ProfileUpdate = {
  name?: unknown;
  password?: unknown;
  phone?: unknown;
  partnerIdToReceiveFrom?: unknown;
  dayMessageLimit?: unknown;
  partnerIdToSend?: unknown;
  geminiApiKey?: unknown;
  removeGeminiApiKey?: unknown;
  partnerInfo?: unknown;
  aiScanLanguage?: unknown;
  localScanLanguage?: unknown;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        _id,
        name,
        login,
        phone,
        role,
        partnerIdToSend,
        partnerIdToReceiveFrom,
        dayMessageLimit,
        partnerInfo,
        aiScanLanguage,
        localScanLanguage,
        onboardingProfileCompleted,
        image,
        "hasGeminiApiKey": defined(geminiApiKey) && geminiApiKey != ""
      }`,
      { userId: session.user.id },
    );

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = (await request.json()) as ProfileUpdate;
    const currentUser = await sanityClient.fetch<{
      _id: string;
      partnerIdToSend?: string;
      partnerIdToReceiveFrom?: string;
    } | null>(
      `*[_type == "user" && _id == $userId][0]{
        _id, partnerIdToSend, partnerIdToReceiveFrom
      }`,
      { userId: session.user.id },
    );
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const setPatch: Record<string, unknown> = {};
    const unsetPaths: string[] = [];

    if (userData.name !== undefined) {
      const name = typeof userData.name === "string" ? userData.name.trim() : "";
      if (!name || name.length > 100) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
      }
      setPatch.name = name;
    }

    if (typeof userData.password === "string" && userData.password.length > 0) {
      if (!validateNewPassword(userData.password)) {
        return NextResponse.json(
          {
            error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
          },
          { status: 400 },
        );
      }
      setPatch.password = await hashPassword(userData.password);
    }

    if (userData.phone !== undefined) {
      const phone = typeof userData.phone === "string" ? userData.phone.trim() : "";
      if (phone.length > 50) {
        return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
      }
      if (phone) setPatch.phone = phone;
      else unsetPaths.push("phone");
    }

    if (userData.dayMessageLimit !== undefined) {
      const limit = Number(userData.dayMessageLimit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
        return NextResponse.json(
          { error: "Daily message limit must be between 1 and 10" },
          { status: 400 },
        );
      }
      setPatch.dayMessageLimit = limit;
    }

    if (userData.partnerIdToSend !== undefined) {
      const partnerIdToSend =
        typeof userData.partnerIdToSend === "string"
          ? userData.partnerIdToSend.trim()
          : "";
      if (!partnerIdToSend || partnerIdToSend.length > 128) {
        return NextResponse.json(
          { error: "Invalid outgoing partner ID" },
          { status: 400 },
        );
      }
      const result = await rotateOutgoingPartnerId(
        session.user.id,
        partnerIdToSend,
      );
      if (!result.ok) {
        return NextResponse.json(
          {
            error:
              result.reason === "duplicate"
                ? "This outgoing partner ID is already in use"
                : "User not found",
          },
          { status: result.reason === "duplicate" ? 409 : 404 },
        );
      }
    }

    if (userData.partnerIdToReceiveFrom !== undefined) {
      const incomingPartnerId =
        typeof userData.partnerIdToReceiveFrom === "string"
          ? userData.partnerIdToReceiveFrom.trim()
          : "";
      if (incomingPartnerId) {
        const result = await connectPartner(session.user.id, incomingPartnerId);
        if (!result.ok) {
          return NextResponse.json(
            {
              error:
                result.reason === "partner-already-connected"
                  ? "Partner is already connected to another account"
                  : "Partner not found",
            },
            { status: result.reason === "partner-already-connected" ? 409 : 400 },
          );
        }
      } else {
        await disconnectPartner(session.user.id);
      }
    }

    for (const field of ["partnerInfo"] as const) {
      if (userData[field] === undefined) continue;
      const value = typeof userData[field] === "string" ? userData[field].trim() : "";
      if (value.length > 10_000) {
        return NextResponse.json({ error: "Partner info is too long" }, { status: 400 });
      }
      if (value) setPatch[field] = value;
      else unsetPaths.push(field);
    }

    for (const field of ["aiScanLanguage", "localScanLanguage"] as const) {
      if (userData[field] === undefined) continue;
      const value = userData[field];
      if (typeof value !== "string" || !SCAN_LANGUAGE_CODES.has(value)) {
        return NextResponse.json(
          { error: `Invalid ${field}` },
          { status: 400 },
        );
      }
      setPatch[field] = value;
    }

    if (userData.removeGeminiApiKey === true) {
      unsetPaths.push("geminiApiKey");
    } else if (
      typeof userData.geminiApiKey === "string" &&
      userData.geminiApiKey.trim()
    ) {
      if (userData.geminiApiKey.length > 500) {
        return NextResponse.json(
          { error: "Gemini API key is too long" },
          { status: 400 },
        );
      }
      setPatch.geminiApiKey = userData.geminiApiKey.trim();
    }

    let patch = sanityClient.patch(currentUser._id);
    if (Object.keys(setPatch).length > 0) patch = patch.set(setPatch);
    if (unsetPaths.length > 0) patch = patch.unset([...new Set(unsetPaths)]);
    if (Object.keys(setPatch).length > 0 || unsetPaths.length > 0) {
      await patch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await request.json();
    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const user = await sanityClient.fetch<{
      _id: string;
      password: string;
    } | null>(
      `*[_type == "user" && _id == $userId][0]{ _id, password }`,
      { userId: session.user.id },
    );
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Неправильний пароль" }, { status: 403 });
    }

    await deleteUserAndRelatedData(user._id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return NextResponse.json(
      { error: "Failed to delete user profile" },
      { status: 500 },
    );
  }
}
