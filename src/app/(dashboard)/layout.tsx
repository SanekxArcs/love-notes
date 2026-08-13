import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthSessionProvider } from "@/components/auth/session-provider";
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
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(255,171,205,.46),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(190,164,255,.36),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(255,208,226,.4),transparent_38%),linear-gradient(180deg,#fff8fc_0%,#fff_48%,#fff7fb_100%)] dark:bg-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(250,0,229,.09)_0_1px,transparent_1.5px)] bg-[length:26px_26px] opacity-45 dark:opacity-25" />
      </div>
      <div className="relative min-h-svh">
        <DashboardHeader />
        <AboutAppButton />
        <main className="w-full">{children}</main>
        <MobileBottomNav />
      </div>
    </AuthSessionProvider>
  );
}
