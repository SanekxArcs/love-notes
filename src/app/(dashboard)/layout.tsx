import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { AmbientBackground } from "@/components/ambient-background";
import { DashboardHeader } from "@/components/dashboard/Header";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { AboutAppButton } from "@/components/dashboard/AboutAppButton";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  return (
    <AuthSessionProvider session={session}>
      <AmbientBackground />
      <div className="relative min-h-svh">
        <DashboardHeader />
        <AboutAppButton />
        <main className="w-full">{children}</main>
        <MobileBottomNav />
      </div>
    </AuthSessionProvider>
  );
}
