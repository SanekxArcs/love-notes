import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { getAdminUserForDeletion, getAdminUsers } from "@/lib/admin";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json({ users: await getAdminUsers() });
  } catch (error) {
    console.error("Error loading admin users:", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити користувачів" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Не можна видалити власний акаунт з менеджера" },
        { status: 400 },
      );
    }

    const result = await getAdminUserForDeletion(userId);
    if (!result) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }
    if (!result.mapped.canDelete) {
      return NextResponse.json(
        {
          error: result.mapped.isConnected
            ? "Підключений акаунт не можна видалити з менеджера"
            : "Акаунт ще не відповідає правилам очищення",
        },
        { status: 409 },
      );
    }

    const history = await sanityClient.fetch<Array<{ _id: string }>>(
      `*[_type == "userMessageHistory" && userId == $userId]{ _id }`,
      { userId },
    );
    const transaction = sanityClient.transaction();
    for (const item of history) {
      transaction.delete(item._id);
    }
    transaction.delete(userId);
    await transaction.commit();

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити користувача" },
      { status: 500 },
    );
  }
}
