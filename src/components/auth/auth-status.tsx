// components/auth-status.tsx
"use client";

import { useSession } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not logged in</div>;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p>
        {" "}
        Привіт, {session?.user?.name || "Kохана"}! Нові повідомлення щодня ❤️
      </p>
    </div>
  );
}
