"use client";

import { useSession } from "next-auth/react";
import BlurText from "../reactbits/BlurText";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div>
        <p className=" animate-pulse bg-gray-500 rounded-md min-w-2/3 w-full text-gray-500">
          Нові повідомлення щодня
        </p>
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
