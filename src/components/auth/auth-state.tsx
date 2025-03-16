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
      <div className="flex items-center flex-col md:flex-row gap-2 md:gap-4">
        <Link href="/login">
          <Button
            size="lg"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-md"
          >
            Увійти
          </Button>
        </Link>
        <span className="text-muted-foreground">або</span>
        <Link href="/register">
          <Button
            className=" hover:bg-pink-900 px-4 py-3 text-lg rounded-md md:px-8 md:py-6"
            variant="outline"
          >
            <ViewTransition name="create-profile">
              Створити профіль
            </ViewTransition>
              
          </Button>
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
        Перейти до повідомлень
      </Button>
    </Link>
  );
}
