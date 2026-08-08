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
      <div className="flex h-12 items-center justify-center rounded-[1.2rem] border border-white/60 bg-white/45">
        <LoaderCircle className="h-5 w-5 animate-spin text-pink-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          asChild
          size="lg"
          className="h-12 rounded-[1.2rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_10px_24px_rgba(207,49,112,.25)] hover:brightness-105"
        >
          <Link href="/login">
            Увійти
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 rounded-[1.2rem] border-white/70 bg-white/48 shadow-[inset_0_1px_1px_rgba(255,255,255,.85)] hover:bg-white/70 dark:border-white/15 dark:bg-white/8 dark:hover:bg-white/12"
        >
          <Link href="/register">
            Зареєструватися
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button
      asChild
      size="lg"
      className="h-12 w-full rounded-[1.2rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_10px_24px_rgba(207,49,112,.25)] hover:brightness-105"
    >
      <Link href="/dashboard">
        Перейти до додатку
      </Link>
    </Button>
  );
}
