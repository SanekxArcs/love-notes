"use client";

import { useSession,} from "next-auth/react";
import { ReactNode } from "react";

interface WraperIfAdminProps {
  children: ReactNode;
}
declare module "next-auth" {
  interface User {
    role?: string;
  }
}

export function WraperIfAdmin({ children }: WraperIfAdminProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not logged in</div>;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {session?.user?.role === "admin" ? children : null}
    </div>
  );
}
