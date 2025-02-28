// app/(dashboard)/layout.tsx

import { auth } from "@/auth";
import { AuthStatus } from "@/components/auth/auth-status";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logout from "@/components/auth/lodout";
import { WraperIfAdmin } from "@/components/auth/WraperIfAdmin";
import { SanityLive } from "@/sanity/lib/live";
import { Database, MessageCircleHeart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 justify-between ">
          <div className="flex flex-col items-center md:items-start gap-4">
            <h1 className="text-2xl font-bold text-pink-600">
              Щоденні повідомлення кохання
            </h1>
            <AuthStatus />
          </div>
          <div className="flex items-center justify-end gap-2">
            <WraperIfAdmin>
              <Link href="/settings/settings">
                <Button size="icon" variant="outline">
                  <Settings />
                </Button>
              </Link>
              <Link href="/settings/messages">
                <Button size="icon" variant="outline">
                  <MessageCircleHeart />
                </Button>
                
              </Link>
              <Link href="/admin">
                <Button size="icon" variant="outline">
                  <Database />
                </Button>
              </Link>
            </WraperIfAdmin>
            <ModeToggle />
            <Logout />
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
