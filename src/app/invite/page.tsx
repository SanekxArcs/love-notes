"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, HeartHandshake, Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Aurora from "@/components/reactbits/Aurora";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const partnerId = searchParams.get("from")?.trim() ?? "";
  const recipientName = searchParams.get("to")?.trim() ?? "";
  const customMessage = searchParams.get("message")?.trim() ?? "";
  const [inviterName, setInviterName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!partnerId) {
      setIsLoading(false);
      return;
    }
    fetch(`/api/invitations?from=${encodeURIComponent(partnerId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Invitation not found");
        return response.json();
      })
      .then((data) => setInviterName(data.name))
      .catch(() => setInviterName(""))
      .finally(() => setIsLoading(false));
  }, [partnerId]);

  const acceptInvitation = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/users/partner-connection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });
      if (!response.ok) throw new Error("Failed to connect partner");
      toast.success("Ви тепер підключені одне до одного 💗");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Не вдалося прийняти запрошення. Спробуйте ще раз.");
    } finally {
      setIsConnecting(false);
    }
  };

  const registerHref = `/register?invite=${encodeURIComponent(partnerId)}`;
  const loginHref = `/login?invite=${encodeURIComponent(partnerId)}`;
  const greeting = recipientName ? `Привіт, ${recipientName}!` : "Запрошення для тебе";
  const message = customMessage || `${inviterName || "Твій партнер"} запрошує тебе до Love Notes.`;

  return (
    <>
      <Aurora colorStops={["#FFB2D1", "#F45B9A", "#8B7CFF"]} blend={0.65} amplitude={0.85} speed={0.35} />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.7),transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(75,32,61,.35),transparent_48%)]" />
      <main className="relative flex min-h-svh items-center justify-center px-4 py-12">
        <header className="fixed right-3 top-[max(.75rem,env(safe-area-inset-top))] z-20">
          <ModeToggle />
        </header>
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 230, damping: 26 }}
          className="w-full max-w-md overflow-hidden rounded-[2.1rem] border border-white/65 bg-white/60 p-5 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_24px_70px_rgba(88,38,70,.18)] backdrop-blur-2xl sm:p-7 dark:border-white/15 dark:bg-zinc-950/60"
        >
          <div className="mx-auto flex h-15 w-15 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.7),0_10px_24px_rgba(207,49,112,.28)]">
            <HeartHandshake className="h-7 w-7" />
          </div>
          {isLoading ? (
            <div className="py-12"><Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" /></div>
          ) : inviterName ? (
            <>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-pink-600 dark:text-pink-300">Love Notes</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] text-zinc-900 dark:text-white">{greeting}</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
              <div className="mt-6 rounded-[1.25rem] border border-pink-100/80 bg-pink-50/55 p-4 text-left dark:border-pink-400/15 dark:bg-pink-950/20">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{inviterName} хоче стати твоїм партнером</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Після підключення ви зможете надсилати одне одному листи, планувати події та зберігати важливі деталі.</p>
              </div>
              {status === "authenticated" ? (
                <Button type="button" onClick={acceptInvitation} disabled={isConnecting} className="mt-5 h-12 w-full rounded-[1.1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105">
                  {isConnecting ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />} Прийняти запрошення
                </Button>
              ) : (
                <div className="mt-5 space-y-2">
                  <Button asChild className="h-12 w-full rounded-[1.1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"><Link href={registerHref}><UserPlus className="h-4 w-4" /> Створити профіль і приєднатися</Link></Button>
                  <Button asChild variant="outline" className="h-11 w-full rounded-[1rem]"><Link href={loginHref}>Вже маю акаунт</Link></Button>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">Запрошення більше не доступне</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Перевір посилання або попроси партнера створити нове.</p>
              <Button asChild variant="outline" className="mt-6 rounded-[1rem]"><Link href="/">На головну</Link></Button>
            </>
          )}
        </motion.section>
      </main>
    </>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InvitePageContent />
    </Suspense>
  );
}
