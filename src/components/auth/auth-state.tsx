// components/auth-status.tsx
"use client";

import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";
import { unstable_ViewTransition as ViewTransition } from "react";

export function AuthState() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div>
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex max-w-80 mx-auto justify-between items-center flex-row gap-2 md:gap-4">
        <Link href="/login">
          <ViewTransition name="login">
            <Button
              id="login"
              className="bg-pink-600 transition-all hover:bg-pink-700 text-white"
            >
              Увійти
            </Button>
          </ViewTransition>
        </Link>
        <span className="text-muted-foreground">або</span>
        <Link href="/register">
          <ViewTransition name="create-profile">
            <Button
              className=" hover:bg-pink-900 rounded-md transition-all"
              variant="outline"
            >
              Зареєструватися
            </Button>
          </ViewTransition>
        </Link>
      </div>
    );
  }

  return (
    <Link href="/dashboard">
      <Button
        size="lg"
        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-full"
      >
        Перейти до додатку
      </Button>
    </Link>
  );
}
