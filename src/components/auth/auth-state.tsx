// components/auth-status.tsx
"use client";

import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";

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
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button
            size="lg"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-full"
          >
            Увійти
          </Button>
        </Link>
          <span className="text-muted-foreground">або</span>
        <Link href="/register">
          <Button
            className=" hover:bg-pink-900 text-white px-8 py-6 text-lg rounded-full"
            variant="outline"
            size="lg"
          >
            Створити профіль
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
        Перейти до дашборду
      </Button>
    </Link>
  );
}
