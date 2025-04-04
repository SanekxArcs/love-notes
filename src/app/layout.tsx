import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://love-notes-three.vercel.app/'),
  title: {
    default: "Щоденні повідомлення кохання | Love Notes",
    template: "%s | Щоденні повідомлення кохання",
  },
  description: "Платформа для обміну щоденними повідомленнями кохання та зміцнення відносин за допомогою щирих слів любові.",
  keywords: ["любовні повідомлення", "кохання", "щоденні нотатки", "love notes", "романтика", "стосунки"],
  authors: [
    { name: "Love Notes Team" }
  ],
  creator: "Love Notes",
  publisher: "Love Notes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "relationship",
  openGraph: {
    title: "Щоденні повідомлення кохання | Love Notes",
    description: "Діліться повідомленнями кохання щодня та зміцнюйте ваші стосунки через теплі слова.",
    url: 'https://love-notes-three.vercel.app/',
    siteName: 'Love Notes',
    locale: 'uk_UA',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Love Notes Preview',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Щоденні повідомлення кохання | Love Notes',
    description: 'Діліться повідомленнями кохання щодня та зміцнюйте ваші стосунки через теплі слова.',
    images: ['/twitter-image.jpg'],
    creator: '@lovenotes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
    // shortcut: '/shortcut-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://love-notes-three.vercel.app/',
    languages: {
      'uk-UA': 'https://love-notes-three.vercel.app/',
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  other: {
    'theme-color': '#FF1493',
    'msapplication-TileColor': '#FF1493',
    'apple-mobile-web-app-title': 'LoveNotes',
  }
};

export const viewport: Viewport = {
  themeColor: '#FF1493',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`relative ${inter.className}`}>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
