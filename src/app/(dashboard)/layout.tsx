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
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Particles
          particleColors={["#fa00e5", "#fa00e5"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={true}
          disableRotation={true}
        />
      </div>
      <div className="min-h-screen ">
        <header>
          <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 justify-between ">
            <div className="flex flex-col items-center md:items-start gap-4">
              <h1>
                <BlurText
                  text="Любовні Вісті"
                  delay={150}
                  animateBy="letters"
                  direction="top"
                  className="text-4xl font-bold text-pink-600 text-center md:text-left"
                />
              </h1>
              <AuthStatus />
            </div>
            <div className="flex items-center flex-row justify-end gap-2">
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
                <Logout />
              </WraperIfAdmin>
              <div className=" absolute right-4 top-4">
                <ModeToggle />
              </div>
            </div>
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
