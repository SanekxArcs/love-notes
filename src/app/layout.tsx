import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });
const siteUrl = "https://love-notes.o-d.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Щоденні повідомлення кохання | Love Notes",
    template: "%s | Щоденні повідомлення кохання",
  },
  description: "Платформа для обміну щоденними повідомленнями кохання та зміцнення відносин за допомогою щирих слів любові.",
  keywords: ["любовні повідомлення", "кохання", "щоденні нотатки", "love notes", "романтика", "стосунки"],
  authors: [{ name: "Love Notes Team" }],
  creator: "Love Notes",
  publisher: "Love Notes",
  applicationName: "Love Notes",
  formatDetection: { email: false, address: false, telephone: false },
  category: "relationship",
  openGraph: {
    title: "Щоденні повідомлення кохання | Love Notes",
    description: "Діліться повідомленнями кохання щодня та зміцнюйте ваші стосунки через теплі слова.",
    url: siteUrl,
    siteName: "Love Notes",
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/og-love-notes.png", width: 1200, height: 630, alt: "Love Notes — простір для вашої історії" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Щоденні повідомлення кохання | Love Notes",
    description: "Діліться повідомленнями кохання щодня та зміцнюйте ваші стосунки через теплі слова.",
    images: ["/og-love-notes.png"],
    creator: "@lovenotes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  manifest: "/manifest.json",
  alternates: { canonical: siteUrl, languages: { "uk-UA": siteUrl } },
  verification: { google: "google-site-verification-code" },
  other: { "theme-color": "#FF1493", "msapplication-TileColor": "#FF1493", "apple-mobile-web-app-title": "LoveNotes" },
};

export const viewport: Viewport = {
  themeColor: "#FF1493",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

function LegalLinks() {
  return (
    <footer className="border-t border-white/50 px-4 py-5 text-center text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span>Love Notes</span>
        <Link href="/privacy" className="transition-colors hover:text-pink-600 dark:hover:text-pink-300">Політика конфіденційності</Link>
        <Link href="/terms" className="transition-colors hover:text-pink-600 dark:hover:text-pink-300">Умови користування</Link>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`relative ${inter.className}`}>
        <Providers>
          {children}
          <LegalLinks />
        </Providers>
      </body>
    </html>
  );
}
