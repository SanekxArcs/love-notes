import type { ReactNode } from "react";

const adminThemeStyles = `
  .admin-theme-shell {
    min-height: 100%;
    color-scheme: light;
  }

  .admin-theme-shell > main {
    background:
      radial-gradient(circle at 8% 0%, rgba(255, 171, 205, .38), transparent 30%),
      radial-gradient(circle at 92% 12%, rgba(190, 164, 255, .24), transparent 28%),
      linear-gradient(180deg, #fff8fc 0%, #fff 52%, #fff7fb 100%) !important;
    color: #18141b;
  }

  .admin-theme-shell [data-slot="card"] {
    border-color: rgba(228, 224, 231, .9) !important;
    background: rgba(255, 255, 255, .78) !important;
    box-shadow: 0 14px 35px rgba(88, 38, 70, .08) !important;
    backdrop-filter: blur(18px);
  }

  .admin-theme-shell [data-slot="card"]:hover {
    border-color: rgba(244, 114, 182, .45) !important;
  }

  .admin-theme-shell button[data-variant="outline"],
  .admin-theme-shell a[data-variant="outline"] {
    border-color: #e4e0e7 !important;
    background: rgba(255, 255, 255, .72) !important;
    color: #514957 !important;
  }

  .admin-theme-shell button[data-variant="outline"]:hover,
  .admin-theme-shell a[data-variant="outline"]:hover {
    background: #fff !important;
    color: #221b27 !important;
  }

  .dark .admin-theme-shell {
    color-scheme: dark;
  }

  .dark .admin-theme-shell > main {
    background:
      radial-gradient(circle at 8% 0%, rgba(190, 56, 124, .18), transparent 30%),
      radial-gradient(circle at 92% 12%, rgba(92, 76, 180, .18), transparent 28%),
      linear-gradient(180deg, #18131c 0%, #0f0d13 58%, #100c12 100%) !important;
    color: #f8f5f8;
  }

  .dark .admin-theme-shell [data-slot="card"] {
    border-color: rgba(255, 255, 255, .1) !important;
    background: rgba(28, 24, 34, .82) !important;
    box-shadow: 0 16px 38px rgba(0, 0, 0, .24) !important;
  }

  .dark .admin-theme-shell [data-slot="card"]:hover {
    border-color: rgba(244, 114, 182, .3) !important;
    background: rgba(35, 29, 42, .9) !important;
  }

  .dark .admin-theme-shell button[data-variant="outline"],
  .dark .admin-theme-shell a[data-variant="outline"] {
    border-color: rgba(255, 255, 255, .12) !important;
    background: rgba(39, 32, 46, .82) !important;
    color: #eee7f0 !important;
  }

  .dark .admin-theme-shell button[data-variant="outline"]:hover,
  .dark .admin-theme-shell a[data-variant="outline"]:hover {
    background: rgba(55, 43, 64, .95) !important;
    color: #fff !important;
  }
`;

export function AdminThemeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-theme-shell">
      <style dangerouslySetInnerHTML={{ __html: adminThemeStyles }} />
      {children}
    </div>
  );
}
