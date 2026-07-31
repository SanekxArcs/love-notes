import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sanityClient } from "@/lib/sanity";
import type { SanityDocument } from "next-sanity";

export async function POST(request: Request) {
  try {
    const { name, login, password, phone } = await request.json();

    if (!name || !login || !password) {
      return NextResponse.json(
        { message: "Name, login, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && login == $login][0]`,
      { login }
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this login already exists" },
        { status: 409 }
      );
    }

    const partnerIdToSend = uuidv4();
    
    const result: SanityDocument<{
      _type: string;
      name: string;
      login: string;
      password: string;
      phone: string;
      partnerIdToSend: string;
      role: string;
      dayMessageLimit: number;
    }> = await sanityClient.create({
      _type: "user",
      name,
      login,
      password, // Note: In a production app, you should hash this password
      phone: phone || undefined,
      partnerIdToSend,
      role: "user",
      dayMessageLimit: 1,
    });

    return NextResponse.json(
      { 
        message: "User registered successfully",
        userId: result._id,
        partnerIdToSend: result.partnerIdToSend
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 }
    );
  }
}
