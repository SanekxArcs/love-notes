// app/(dashboard)/layout.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SanityLive } from "@/sanity/lib/live";
import Particles from "@/components/reactbits/Particles";
import { DashboardHeader } from "@/components/dashboard/Header";

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
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
          <SanityLive />
        </main>
      </div>
    </>
  );
}
