"use client";

import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import BlurText from "../reactbits/BlurText";

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
    <div>
      <BlurText
        text={`${session?.user?.role === "admin" ? "" : "Привіт, "}${session?.user?.name || "Kохана"}!😘`}
        delay={200}
        animateBy="words"
        direction="top"
        className="flex flex-row items-center justify-center"
      />
      <BlurText
        text={`${session?.user?.role === "admin" ? "" : "❤️ Нові повідомлення щодня ❤️"}`}
        delay={250}
        animateBy="words"
        direction="top"
        className="flex flex-row items-center justify-center"
      />
    </div>
  );
}
