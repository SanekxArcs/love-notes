// app/(dashboard)/layout.tsx

import { auth } from "@/auth";
import { AuthStatus } from "@/components/auth/auth-status";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logout from "@/components/auth/lodout";
import { WraperIfAdmin } from "@/components/auth/WraperIfAdmin";
import { SanityLive } from "@/sanity/lib/live";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessions = await auth();

  if (!sessions) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen ">

      <header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pink-600">
              Щоденні повідомлення кохання
            </h1>
            <AuthStatus />
          </div>

          <div className="flex items-center gap-4">
            <WraperIfAdmin>
              <Link href="/settings/settings">Налаштування</Link>
              <Link href="/settings/messages">Повідомлення</Link>
              <Link href="/admin">База</Link>

            </WraperIfAdmin>

            <Logout />

            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
        <SanityLive />
        
      </main>
    </div>
  );
}
