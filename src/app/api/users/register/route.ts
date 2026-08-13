import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  hashPassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/lib/password";
import { sanityClient } from "@/lib/sanity";
import { guardRequest } from "@/lib/request-guard";

export async function POST(request: Request) {
  const rejected = await guardRequest(request, {
    scope: "register",
    limit: 5,
    windowMs: 60 * 60 * 1000,
    checkBot: true,
  });
  if (rejected) return rejected;

  try {
    const { name, login, password, phone, partnerIdToReceiveFrom } =
      await request.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedLogin = typeof login === "string" ? login.trim() : "";

    if (!normalizedName || !normalizedLogin || !password) {
      return NextResponse.json(
        { message: "Name, login, and password are required" },
        { status: 400 },
      );
    }
    if (!validateNewPassword(password)) {
      return NextResponse.json(
        {
          message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && login == $login][0]{ _id }`,
      { login: normalizedLogin },
    );
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this login already exists" },
        { status: 409 },
      );
    }

    const partnerIdToSend = uuidv4();
    const invitedPartnerId =
      typeof partnerIdToReceiveFrom === "string"
        ? partnerIdToReceiveFrom.trim()
        : "";

    const inviter = invitedPartnerId
      ? await sanityClient.fetch<{
          _id: string;
          _rev: string;
          partnerIdToReceiveFrom?: string;
        } | null>(
        `*[_type == "user" && partnerIdToSend == $partnerId][0]{
          _id, _rev, partnerIdToReceiveFrom
        }`,
        { partnerId: invitedPartnerId },
      )
      : null;
    if (invitedPartnerId) {
      if (!inviter) {
        return NextResponse.json(
          { message: "Invitation is no longer valid" },
          { status: 400 },
        );
      }
      if (inviter.partnerIdToReceiveFrom?.trim()) {
        return NextResponse.json(
          { message: "Invitation owner is already connected" },
          { status: 409 },
        );
      }
    }

    const userId = `user.${uuidv4()}`;
    const newUser = {
      _id: userId,
      _type: "user",
      name: normalizedName,
      login: normalizedLogin,
      password: await hashPassword(password),
      phone: typeof phone === "string" ? phone.trim() || undefined : undefined,
      partnerIdToSend,
      role: "user",
      dayMessageLimit: 1,
      onboardingProfileCompleted: false,
      partnerIdToReceiveFrom: invitedPartnerId || undefined,
    };
    const transaction = sanityClient.transaction().create(newUser);
    if (inviter) {
      transaction.patch(inviter._id, (patch) =>
        patch
          .ifRevisionId(inviter._rev)
          .set({ partnerIdToReceiveFrom: partnerIdToSend }),
      );
    }
    await transaction.commit();

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId,
        partnerIdToSend,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 },
    );
  }
}
