"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  MessageCircleHeart,
  NotebookPen,
  RefreshCw,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminUser } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
});

function formatDate(value: string | null) {
  if (!value) return "Ще не зафіксовано";
  return dateFormatter.format(new Date(value));
}

function userStatus(user: AdminUser) {
  if (user.isConnected) return { label: "Підключений", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" };
  if (user.emptyAccountEligible) return { label: "Порожній · 14+ днів", className: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300" };
  if (user.inactiveAccountEligible) return { label: "Неактивний · 90+ днів", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" };
  if (user.isEmpty) return { label: "Порожній", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" };
  return { label: "Окремий профіль", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = (await response.json()) as { users?: AdminUser[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Не вдалося завантажити користувачів");
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося завантажити користувачів");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const deleteUser = useCallback(async (user: AdminUser) => {
    if (!user.canDelete) return;
    const reason = user.deletionReason === "empty-14-days"
      ? "порожній акаунт старше 14 днів"
      : "акаунт без активності понад 90 днів";
    if (!window.confirm(`Видалити ${user.name} (${user.login})? Це остаточно видалить профіль, його повідомлення, нотатки та події. Причина: ${reason}.`)) return;

    setDeletingId(user.id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Не вдалося видалити користувача");
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success("Користувача видалено");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося видалити користувача");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const eligibleCount = users.filter((user) => user.canDelete).length;

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_15%_8%,rgba(255,171,205,.46),transparent_34%),linear-gradient(180deg,#fff8fc_0%,#fff_48%,#fff7fb_100%)] px-4 py-5 dark:bg-zinc-950 sm:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <Button asChild variant="ghost" className="mb-4 rounded-[1rem]"><Link href="/admin/dashboard"><ArrowLeft className="h-4 w-4" /> До огляду</Link></Button>
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-pink-600 dark:text-pink-300">Адмін-панель</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-.05em] text-zinc-900 dark:text-white">Менеджер користувачів</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Підключені профілі захищені від цього очищення. Видалення доступне лише для профілів, які відповідають 14- або 90-денному правилу.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadUsers()} disabled={isLoading} className="rounded-[1rem] border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/5"><RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Оновити</Button>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Card className="rounded-[1.4rem] border-white/65 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] dark:border-white/10 dark:bg-zinc-950/45"><CardContent className="flex items-center gap-3 p-4"><UsersRound className="h-5 w-5 text-pink-500" /><div><p className="text-xs text-muted-foreground">Усього профілів</p><p className="text-xl font-bold">{users.length}</p></div></CardContent></Card>
          <Card className="rounded-[1.4rem] border-white/65 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] dark:border-white/10 dark:bg-zinc-950/45"><CardContent className="flex items-center gap-3 p-4"><Trash2 className="h-5 w-5 text-orange-500" /><div><p className="text-xs text-muted-foreground">Можна видалити</p><p className="text-xl font-bold">{eligibleCount}</p></div></CardContent></Card>
          <Card className="rounded-[1.4rem] border-white/65 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] dark:border-white/10 dark:bg-zinc-950/45"><CardContent className="flex items-center gap-3 p-4"><CircleAlert className="h-5 w-5 text-violet-500" /><div><p className="text-xs text-muted-foreground">Підключені</p><p className="text-xl font-bold">{users.filter((user) => user.isConnected).length}</p></div></CardContent></Card>
        </div>

        <Card className="rounded-[1.6rem] border-white/65 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_18px_48px_rgba(88,38,70,.1)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
          <CardHeader><CardTitle>Профілі</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Завантаження…</div>
            ) : users.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">Користувачів ще немає.</div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  const status = userStatus(user);
                  return (
                    <article key={user.id} className="rounded-[1.25rem] border border-white/65 bg-white/45 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.75)] dark:border-white/10 dark:bg-white/5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><UserRound className="h-4 w-4 text-pink-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">{user.name}</h2><Badge className={status.className}>{status.label}</Badge>{user.role === "admin" ? <Badge variant="outline">Admin</Badge> : null}</div>
                          <p className="mt-1 text-sm text-muted-foreground">@{user.login} · Створено {formatDate(user.createdAt)} · Остання активність {formatDate(user.lastActiveAt || user.updatedAt)}</p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><MessageCircleHeart className="h-3.5 w-3.5" /> {user.messageCount}</span><span className="inline-flex items-center gap-1"><NotebookPen className="h-3.5 w-3.5" /> {user.noteCount}</span><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {user.calendarEventCount}</span>{user.hasGeminiKey ? <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-300"><CheckCircle2 className="h-3.5 w-3.5" /> Gemini</span> : null}</div>
                        </div>
                        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                          {user.canDelete ? <Button type="button" variant="destructive" onClick={() => void deleteUser(user)} disabled={deletingId === user.id} className="rounded-[.9rem]"><Trash2 className="h-4 w-4" />{deletingId === user.id ? "Видалення…" : "Видалити"}</Button> : <span className="text-right text-xs text-muted-foreground">{user.isConnected ? "Захищено: є підключення" : "Поки що не підлягає очищенню"}</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
