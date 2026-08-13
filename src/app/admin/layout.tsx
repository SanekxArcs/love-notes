import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side defense for every route below /admin, including Sanity Studio.
 * The proxy also protects navigation, but this layout keeps the authorization
 * boundary in the route tree itself.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect(session?.user ? "/dashboard" : "/login");
  }

  return children;
}
