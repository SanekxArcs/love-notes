import type { ReactNode } from "react";
import { AdminThemeLayout } from "@/app/admin/AdminThemeLayout";

export default function AdminUsersLayout({ children }: { children: ReactNode }) {
  return <AdminThemeLayout>{children}</AdminThemeLayout>;
}
