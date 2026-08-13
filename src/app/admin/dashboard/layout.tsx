import type { ReactNode } from "react";
import { AdminThemeLayout } from "@/app/admin/AdminThemeLayout";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminThemeLayout>{children}</AdminThemeLayout>;
}
