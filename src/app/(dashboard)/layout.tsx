// app/(dashboard)/layout.tsx

import { auth } from "@/auth";
import { AuthStatus } from "@/components/auth/auth-status";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logout from "@/components/auth/lodout";
import { WraperIfAdmin } from "@/components/auth/WraperIfAdmin";
import { SanityLive } from "@/sanity/lib/live";
import { Database, MailCheck, MailPlus, MessageCircleHeart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Particles from "@/components/reactbits/Particles";
import BlurText from "@/components/reactbits/BlurText";

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
    <>
      <div className="absolute opacity-90 inset-0 -z-10 w-full h-full">
        <Particles
          particleColors={["#fa00e5", "#fa00e5"]}
          particleCount={300}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={true}
        />
      </div>
      <div className="min-h-svh relative">
        <div className="fixed right-4 bottom-4 z-10">
          <ModeToggle />
        </div>
        <header className=" mx-auto lg:px-8 max-w-3xl lg:max-w-7xl px-4 pt-6  flex flex-col md:flex-row gap-6 justify-between ">
          <div className="flex flex-col items-center md:items-start gap-4">
            <h1>
              <BlurText
                text="Щоденні повідомлення кохання"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-xl flex items-center text-nowrap justify-center font-bold mx-auto text-pink-600 md:text-left"
              />
            </h1>
            <AuthStatus />
          </div>
          <div className="flex flex-row justify-end items-end gap-2 px-4 md:px-0 lg:px-0">
            <Link href="/profile">
              <Button size="icon" variant="outline">
                <User />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="icon" variant="outline">
                <MessageCircleHeart />
              </Button>
            </Link>
            
              
            <WraperIfAdmin>
              <Link href="/messages">
                <Button size="icon" variant="outline">
                  <MailPlus />
                </Button>
              </Link>
              <Link href="/history">
                <Button size="icon" variant="outline">
                  <MailCheck />
                </Button></Link>
              <Link href="/admin">
                <Button size="icon" variant="outline">
                  <Database />
                </Button>
              </Link>
            </WraperIfAdmin>
            <Logout />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
          <SanityLive />
        </main>
      </div>
    </>
  );
}
