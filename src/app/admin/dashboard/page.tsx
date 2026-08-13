import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  HeartHandshake,
  MessageCircleHeart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminMetrics } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const numberFormatter = new Intl.NumberFormat("uk-UA");

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card className="rounded-[1.5rem] border-white/65 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_18px_48px_rgba(88,38,70,.1)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-[-.05em] text-zinc-900 dark:text-white">
          {numberFormatter.format(value)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const metrics = await getAdminMetrics();

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_15%_8%,rgba(255,171,205,.46),transparent_34%),linear-gradient(180deg,#fff8fc_0%,#fff_48%,#fff7fb_100%)] px-4 py-5 dark:bg-zinc-950 sm:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <Button asChild variant="ghost" className="mb-4 rounded-[1rem]">
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> До застосунку</Link>
        </Button>

        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-pink-600 dark:text-pink-300">Адмін-панель</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-.05em] text-zinc-900 dark:text-white">Огляд Love Notes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Коротка картина акаунтів, пар, контенту та очищення неактивних профілів.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-[1rem] border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/5">
              <Link href="/admin/users"><UsersRound className="h-4 w-4" /> Користувачі</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-[1rem] border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/5">
              <Link href="/admin"><ShieldCheck className="h-4 w-4" /> Sanity Studio</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Користувачі" value={metrics.userCount} hint={`${metrics.adminCount} адміністраторів`} icon={UserRound} tone="bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300" />
          <MetricCard label="Підключені пари" value={metrics.coupleCount} hint={`${metrics.connectedUserCount} підключених акаунтів`} icon={HeartHandshake} tone="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300" />
          <MetricCard label="Повідомлення" value={metrics.messageCount} hint={`${metrics.shownMessageCount} уже показано`} icon={MessageCircleHeart} tone="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300" />
          <MetricCard label="Нотатки" value={metrics.noteCount} hint="Особисті та спільні нотатки" icon={NotebookPen} tone="bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300" />
          <MetricCard label="Події календаря" value={metrics.calendarEventCount} hint="Важливі, щоденні та інтимні" icon={CalendarDays} tone="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300" />
          <MetricCard label="Активні за 30 днів" value={metrics.activeUserCount} hint="За останньою активністю профілю" icon={Activity} tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" />
          <MetricCard label="Gemini підключено" value={metrics.geminiUserCount} hint="Користувачі з власним API key" icon={Sparkles} tone="bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300" />
          <MetricCard label="До очищення" value={metrics.cleanupEligibleCount} hint={`${metrics.emptyAccountCount} порожніх акаунтів`} icon={Trash2} tone="bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300" />
        </div>

        <section className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="rounded-[1.5rem] border-white/65 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_18px_48px_rgba(88,38,70,.1)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
            <CardHeader><CardTitle>Що означають цифри</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p><strong className="text-foreground">Підключена пара</strong> — два профілі, пов’язані через invite ID. Адмін-лічильник не показує текст приватного контенту.</p>
              <p><strong className="text-foreground">До очищення</strong> — непідключені акаунти, які або порожні понад 14 днів, або неактивні понад 90 днів. Видалення запускається вручну зі сторінки користувачів.</p>
              <p><strong className="text-foreground">Активність</strong> — остання зміна документа Sanity, оскільки поточна версія застосунку ще не має окремого журналу входів.</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.5rem] border-pink-100 bg-pink-50/60 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] dark:border-pink-400/15 dark:bg-pink-950/20">
            <CardHeader><CardTitle>Очищення акаунтів</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">Перегляньте статус кожного профілю та видаліть лише ті акаунти, які відповідають політиці зберігання.</p>
              <Button asChild className="w-full rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"><Link href="/admin/users"><Trash2 className="h-4 w-4" /> Відкрити менеджер користувачів</Link></Button>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}
