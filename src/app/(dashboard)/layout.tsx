// app/(dashboard)/layout.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SanityLive } from "@/sanity/lib/live";
import Particles from "@/components/reactbits/Particles";
import { DashboardHeader } from "@/components/dashboard/Header";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { AboutAppButton } from "@/components/dashboard/AboutAppButton";

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
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(255,171,205,.46),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(190,164,255,.36),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(255,208,226,.4),transparent_38%),linear-gradient(180deg,#fff8fc_0%,#fff_48%,#fff7fb_100%)] dark:bg-none">
        <div className="absolute inset-0 opacity-25 transition-opacity duration-300 dark:opacity-90">
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
      </div>
      <div className="min-h-svh relative">
        <DashboardHeader />
        <AboutAppButton />
        <main className="w-full">
          {children}
          <SanityLive />
        </main>
        <MobileBottomNav />
      </div>
    </>
  );
}
