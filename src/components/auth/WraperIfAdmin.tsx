"use client";

import { LoaderCircle } from "lucide-react";
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
    return (
      <>
        <LoaderCircle className="animate-spin" />
      </>
    );
  }

  if (status === "unauthenticated") {
    return <p>Not logged in</p>;
  }

  return (
    <>
      {session?.user?.role === "admin" ? children : null}
    </>
  );
}
