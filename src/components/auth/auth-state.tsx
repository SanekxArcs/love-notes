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
    return <Link href="/login">
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-full"
            >
              Увійти
            </Button>
          </Link>;
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
