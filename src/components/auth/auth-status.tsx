// components/auth-status.tsx
"use client";

import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div>
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>Not logged in</div>;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p>
        Привіт, {session?.user?.name || "Kохана"}!
        {session?.user?.role === "admin" ? "" : " Нові повідомлення щодня ❤️" }
      </p>
    </div>
  );
}
