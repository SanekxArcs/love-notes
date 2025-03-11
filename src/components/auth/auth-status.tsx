"use client";

import { useSession } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <>
      </>
    );
  }

  if (status === "unauthenticated") {
    return <div>Not logged in</div>;
  }

  return (
    <p className="flex select-none items-center justify-center py-1 px-2 mx-auto truncate">{session?.user?.name || "Kохана"}
    </p>
  );
}
