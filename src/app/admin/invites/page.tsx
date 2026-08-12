"use client";

import { type ChangeEvent, useCallback, useId, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, ExternalLink, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminInvitesPage() {
  const [title, setTitle] = useState("Створіть ваш простір для двох");
  const [message, setMessage] = useState("Love Notes — місце для теплих слів, спільних планів і важливих спогадів.");
  const [campaign, setCampaign] = useState("community");
  const titleId = useId();
  const messageId = useId();
  const campaignId = useId();
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams({ title: title.trim(), message: message.trim() });
    if (campaign.trim()) params.set("campaign", campaign.trim());
    return `${window.location.origin}/join?${params.toString()}`;
  }, [campaign, message, title]);
  const ogImageUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams({ title: title.trim(), message: message.trim() });
    return `${window.location.origin}/api/og/join?${params.toString()}`;
  }, [message, title]);
  const onTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value), []);
  const onMessageChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value), []);
  const onCampaignChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setCampaign(event.target.value), []);
  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Публічне запрошення скопійовано");
  }, [url]);
  const shareLink = useCallback(async () => {
    if (!navigator.share) return copyLink();
    try { await navigator.share({ title, text: message, url }); } catch (error) { if ((error as Error).name !== "AbortError") toast.error("Не вдалося поширити посилання"); }
  }, [copyLink, message, title, url]);

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_15%_8%,rgba(255,171,205,.46),transparent_34%),linear-gradient(180deg,#fff8fc_0%,#fff_48%,#fff7fb_100%)] px-4 py-5 dark:bg-zinc-950 sm:px-6">
      <section className="mx-auto w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4 rounded-[1rem]"><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> До застосунку</Link></Button>
        <div className="rounded-[2rem] border border-white/65 bg-white/60 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_24px_70px_rgba(88,38,70,.14)] backdrop-blur-2xl sm:p-7 dark:border-white/15 dark:bg-zinc-950/65">
          <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white"><Sparkles className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-pink-600 dark:text-pink-300">Адмін-інструмент</p><h1 className="mt-1 text-2xl font-bold tracking-[-.04em]">Публічне запрошення</h1><p className="mt-1 text-sm leading-6 text-muted-foreground">Для всіх охочих. Люди зареєструються у власному просторі — без підключення до твого акаунта.</p></div></div>
          <div className="mt-7 space-y-5">
            <div className="space-y-2"><Label htmlFor={titleId}>Заголовок</Label><Input id={titleId} value={title} onChange={onTitleChange} maxLength={90} className="h-11 rounded-[1rem]" /></div>
            <div className="space-y-2"><Label htmlFor={messageId}>Текст запрошення</Label><Textarea id={messageId} value={message} onChange={onMessageChange} maxLength={220} className="min-h-28 rounded-[1rem]" /></div>
            <div className="space-y-2"><Label htmlFor={campaignId}>Назва кампанії (для майбутньої аналітики)</Label><Input id={campaignId} value={campaign} onChange={onCampaignChange} maxLength={80} className="h-11 rounded-[1rem]" /><p className="text-xs text-muted-foreground">Не відображається для отримувачів і не підключає їх до адміна.</p></div>
            <section className="overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/45 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <h2 className="text-sm font-semibold">OG-прев’ю</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Саме так картка виглядатиме в месенджерах.</p>
                </div>
                <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-pink-700 dark:bg-pink-950/50 dark:text-pink-200">1200 × 630</span>
              </div>
              <div className="overflow-hidden rounded-[1rem] border border-pink-100/80 bg-pink-50/50 dark:border-pink-400/15 dark:bg-pink-950/15">
                {ogImageUrl ? (
                  <Image
                    src={ogImageUrl}
                    alt={`OG-прев’ю: ${title || "Love Notes"}`}
                    width={1200}
                    height={630}
                    unoptimized
                    className="block aspect-[1200/630] w-full object-cover"
                  />
                ) : null}
              </div>
            </section>
            <div className="rounded-[1.25rem] border border-pink-100 bg-pink-50/60 p-3 dark:border-pink-400/15 dark:bg-pink-950/20"><p className="break-all text-xs leading-5 text-pink-800 dark:text-pink-100">{url || "Створюємо посилання…"}</p></div>
            <div className="grid gap-2 sm:grid-cols-3"><Button type="button" variant="outline" onClick={copyLink} className="h-11 rounded-[1rem]"><Copy className="h-4 w-4" /> Копіювати</Button><Button type="button" variant="outline" asChild className="h-11 rounded-[1rem]"><a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Перевірити</a></Button><Button type="button" onClick={shareLink} className="h-11 rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"><Send className="h-4 w-4" /> Надіслати</Button></div>
          </div>
        </div>
      </section>
    </main>
  );
}
