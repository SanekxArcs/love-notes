import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegalPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_15%_8%,rgba(255,171,205,.46),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(190,164,255,.3),transparent_32%),linear-gradient(180deg,#fff8fc_0%,#fff_48%,#fff7fb_100%)] px-4 py-5 dark:bg-zinc-950 sm:px-6 sm:py-8">
      <article className="mx-auto w-full max-w-3xl">
        <Button asChild variant="ghost" className="mb-4 rounded-[1rem]"><Link href="/profile"><ArrowLeft className="h-4 w-4" /> До профілю</Link></Button>
        <section className="overflow-hidden rounded-[2rem] border border-white/65 bg-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_24px_70px_rgba(88,38,70,.14)] backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/65">
          <header className="border-b border-white/55 p-5 sm:p-8 dark:border-white/10"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white"><Scale className="h-5 w-5" /></div><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-pink-600 dark:text-pink-300"><Heart className="h-3.5 w-3.5 fill-current" /> Love Notes</div><h1 className="mt-2 text-3xl font-bold tracking-[-.05em] text-zinc-900 dark:text-white">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-xs text-muted-foreground">Останнє оновлення: 13 серпня 2026 року</p></div></div></header>
          <div className="space-y-8 p-5 text-sm leading-7 text-zinc-700 sm:p-8 dark:text-zinc-300">{children}</div>
        </section>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2 className="text-lg font-bold tracking-[-.02em] text-zinc-900 dark:text-white">{title}</h2><div className="mt-2 space-y-3">{children}</div></section>;
}
