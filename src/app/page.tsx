"use client";

import { ViewTransition } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MessageCircleHeart,
  NotebookPen,
  Sparkles,
  Stars,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import { AuthState } from "@/components/auth/auth-state";
import { HelpDialog } from "@/components/HelpDialog";
import Aurora from "@/components/reactbits/Aurora";

const features = [
  {
    icon: MessageCircleHeart,
    eyebrow: "Кожен день",
    title: "Особливі повідомлення",
    description:
      "Пиши теплі слова наперед, а кохана людина відкриватиме їх як маленькі сюрпризи протягом дня.",
    tone: "pink",
  },
  {
    icon: CalendarDays,
    eyebrow: "Разом у планах",
    title: "Спільний календар",
    description:
      "Зберігайте дати побачень, річниці та важливі події в одному календарі, щоб нічого не загубилося.",
    tone: "violet",
  },
  {
    icon: NotebookPen,
    eyebrow: "Памʼятати важливе",
    title: "Нотатки про вас",
    description:
      "Фіксуйте улюблені речі, мрії, ідеї подарунків та маленькі деталі, які хочеться берегти.",
    tone: "amber",
  },
  {
    icon: Sparkles,
    eyebrow: "Коли потрібна ідея",
    title: "AI-помічник",
    description:
      "Запитай про подарунок, побачення чи сюрприз — AI підкаже, спираючись на ваші спільні нотатки.",
    tone: "blue",
  },
] as const;

const toneClasses = {
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
};

export default function LandingPage() {
  return (
    <>
      <Aurora
        colorStops={["#FFB2D1", "#F45B9A", "#8B7CFF"]}
        blend={0.65}
        amplitude={0.85}
        speed={0.35}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.7),transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(75,32,61,.35),transparent_48%)]" />

      <div className="min-h-svh px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#ff87b5,#e13476)] text-white shadow-[0_7px_18px_rgba(207,49,112,.25)]">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <span className="text-sm font-bold tracking-[-.02em] text-zinc-900 dark:text-white">
              Love Notes
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/help"
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-white/40 hover:text-zinc-900 sm:block dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Як це працює
            </Link>
            <ModeToggle />
          </div>
        </header>

        <ViewTransition>
          <main className="mx-auto w-full max-w-6xl">
            <section className="grid items-center gap-10 pb-16 pt-14 md:grid-cols-[1.05fr_.95fr] md:gap-14 md:pb-20 md:pt-20">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 230, damping: 26 }}
                className="max-w-xl"
              >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-xs font-semibold text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] backdrop-blur-xl dark:border-white/15 dark:bg-zinc-950/40 dark:text-pink-200">
                  <Stars className="h-3.5 w-3.5" />
                  Простір для вашої історії
                </div>
                <h1 className="text-balance text-5xl font-bold leading-[.98] tracking-[-.065em] text-zinc-900 sm:text-6xl lg:text-7xl dark:text-white">
                  Маленькі слова.
                  <span className="block bg-linear-to-r from-pink-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
                    Великі почуття.
                  </span>
                </h1>
                <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
                  Love Notes допомагає бути поруч навіть на відстані: даруйте
                  щоденні сюрпризи, плануйте важливе та зберігайте те, що робить
                  ваші стосунки особливими.
                </p>
                <div className="mt-8 max-w-md">
                  <AuthState />
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-pink-500" /> Для двох
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-pink-500" /> Простий старт
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-pink-500" /> Ваш приватний простір
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 190, damping: 24 }}
                className="relative mx-auto w-full max-w-[470px]"
              >
                <div className="absolute -right-3 top-8 h-28 w-28 rounded-full bg-pink-300/35 blur-3xl dark:bg-pink-500/15" />
                <div className="absolute -bottom-4 -left-3 h-32 w-32 rounded-full bg-violet-300/35 blur-3xl dark:bg-violet-500/15" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/60 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_28px_65px_rgba(88,38,70,.2)] backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/55">
                  <div className="rounded-[1.45rem] bg-[#fff8fb] p-5 dark:bg-zinc-900/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink-500">
                          Сьогодні, 14 лютого
                        </p>
                        <p className="mt-1 text-xl font-bold tracking-[-.04em] text-zinc-900 dark:text-white">
                          Твоя любов сьогодні
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-500 dark:bg-pink-950/70 dark:text-pink-300">
                        <Heart className="h-5 w-5 fill-current" />
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.25rem] bg-[linear-gradient(135deg,#ff82b3,#e1457d)] p-5 text-white shadow-[0_12px_24px_rgba(225,69,125,.22)]">
                      <div className="flex items-center justify-between text-xs text-white/75">
                        <span>Повідомлення від Саші</span>
                        <span>♡</span>
                      </div>
                      <p className="mt-5 text-xl font-semibold leading-7 tracking-[-.03em]">
                        «Ти робиш навіть звичайні дні особливими. Дякую, що ти є.»
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-xs text-white/80">
                        <Clock3 className="h-3.5 w-3.5" /> Наступна нотатка вже скоро
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-[1.1rem] border border-pink-100 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                        <CalendarDays className="h-4 w-4 text-violet-500" />
                        <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">Річниця</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">через 12 днів</p>
                      </div>
                      <div className="rounded-[1.1rem] border border-pink-100 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                        <NotebookPen className="h-4 w-4 text-amber-500" />
                        <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">Ідея подарунка</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">збережено в нотатках</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            <section className="border-t border-white/45 py-14 dark:border-white/10">
              <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-pink-600 dark:text-pink-300">
                    Все для близькості
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] text-zinc-900 sm:text-4xl dark:text-white">
                    Ваші почуття — в одному місці
                  </h2>
                </div>
                <p className="max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Не просто повідомлення. Невеликий щоденний ритуал, який легко підтримувати.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.article
                      key={feature.title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: index * 0.07 }}
                      className="group rounded-[1.5rem] border border-white/65 bg-white/45 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-zinc-950/35"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[feature.tone]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-zinc-400 dark:text-zinc-500">
                        {feature.eyebrow}
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold tracking-[-.03em] text-zinc-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {feature.description}
                      </p>
                    </motion.article>
                  );
                })}
              </div>
            </section>

            <section className="mb-8 grid items-center gap-6 overflow-hidden rounded-[1.75rem] border border-white/65 bg-white/48 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] backdrop-blur-xl sm:p-8 md:grid-cols-[1fr_auto] dark:border-white/10 dark:bg-zinc-950/35">
              <div>
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-300">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-[.16em]">Почніть свою історію</p>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-[-.045em] text-zinc-900 dark:text-white">
                  Є що сказати коханій людині?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Створіть перше повідомлення, запросіть партнера та перетворіть турботу на щось, чого хочеться чекати щодня.
                </p>
              </div>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm font-semibold text-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,.9)] transition hover:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Дізнатися більше <ArrowUpRight className="h-4 w-4" />
              </Link>
            </section>
          </main>
        </ViewTransition>

        <p className="mx-auto mt-4 max-w-6xl text-center text-xs text-zinc-500 dark:text-zinc-400">
          Створено з любов&apos;ю для того, хто завжди у твоєму серці
        </p>
        <div className="fixed bottom-4 right-4 z-20">
          <HelpDialog />
        </div>
      </div>
    </>
  );
}
