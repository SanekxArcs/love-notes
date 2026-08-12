import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, UserPlus } from "lucide-react";
import Aurora from "@/components/reactbits/Aurora";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";

type JoinPageProps = { searchParams: Promise<{ title?: string; message?: string; campaign?: string }> };

function cleanText(value: string | undefined, fallback: string, limit: number) {
  const text = value?.trim().replace(/\s+/g, " ");
  return text ? text.slice(0, limit) : fallback;
}

function paramsForJoin(campaign: string | undefined) {
  return campaign ? `?campaign=${encodeURIComponent(campaign)}` : "";
}

export async function generateMetadata({ searchParams }: JoinPageProps): Promise<Metadata> {
  const { title, message, campaign } = await searchParams;
  const cleanTitle = cleanText(title, "Створіть ваш простір для двох", 90);
  const cleanMessage = cleanText(message, "Love Notes — місце для теплих слів, спільних планів і важливих спогадів.", 220);
  const params = new URLSearchParams({ title: cleanTitle, message: cleanMessage });
  if (campaign?.trim()) params.set("campaign", campaign.trim().slice(0, 80));
  const imageUrl = `/api/og/join?${params.toString()}`;

  return {
    title: cleanTitle,
    description: cleanMessage,
    robots: { index: false, follow: false },
    openGraph: {
      title: cleanTitle,
      description: cleanMessage,
      type: "website",
      siteName: "Love Notes",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: cleanTitle }],
    },
    twitter: { card: "summary_large_image", title: cleanTitle, description: cleanMessage, images: [imageUrl] },
  };
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { title, message, campaign } = await searchParams;
  const cleanTitle = cleanText(title, "Створіть ваш простір для двох", 90);
  const cleanMessage = cleanText(message, "Love Notes — місце для теплих слів, спільних планів і важливих спогадів.", 220);
  const registrationQuery = paramsForJoin(campaign?.trim().slice(0, 80));

  return (
    <>
      <Aurora colorStops={["#FFB2D1", "#F45B9A", "#8B7CFF"]} blend={0.65} amplitude={0.85} speed={0.35} />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.7),transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(75,32,61,.35),transparent_48%)]" />
      <main className="relative flex min-h-svh items-center justify-center px-4 py-12">
        <header className="fixed right-3 top-[max(.75rem,env(safe-area-inset-top))] z-20"><ModeToggle /></header>
        <section className="w-full max-w-md overflow-hidden rounded-[2.1rem] border border-white/65 bg-white/60 p-5 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_24px_70px_rgba(88,38,70,.18)] backdrop-blur-2xl sm:p-7 dark:border-white/15 dark:bg-zinc-950/60">
          <div className="mx-auto flex h-15 w-15 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.7),0_10px_24px_rgba(207,49,112,.28)]"><Heart className="h-7 w-7 fill-current" /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-pink-600 dark:text-pink-300">Love Notes</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] text-zinc-900 dark:text-white">{cleanTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{cleanMessage}</p>
          <div className="mt-6 rounded-[1.25rem] border border-pink-100/80 bg-pink-50/55 p-4 text-left dark:border-pink-400/15 dark:bg-pink-950/20">
            <div className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" /><p className="text-xs leading-5 text-muted-foreground">Пишіть одне одному листи-сюрпризи, плануйте важливі дати та зберігайте маленькі речі, що роблять вас ближчими.</p></div>
          </div>
          <div className="mt-5 space-y-2">
            <Button asChild className="h-12 w-full rounded-[1.1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"><Link href={`/register${registrationQuery}`}><UserPlus className="h-4 w-4" /> Створити профіль</Link></Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-[1rem]"><Link href={`/login${registrationQuery}`}>Вже маю акаунт</Link></Button>
          </div>
        </section>
      </main>
    </>
  );
}
