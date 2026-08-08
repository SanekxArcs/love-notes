"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarHeart,
  Heart,
  Info,
  MailPlus,
  MessageCircleHeart,
  NotebookText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const navigationItems: NavItem[] = [
  { href: "/dashboard", icon: MessageCircleHeart, label: "Головна" },
  { href: "/messages", icon: MailPlus, label: "Повідомлення" },
  { href: "/calendar", icon: CalendarHeart, label: "Календар" },
  { href: "/notes", icon: NotebookText, label: "Нотатки" },
];

function NavigationLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-2 rounded-[1rem] px-3 text-xs font-semibold transition-colors",
        active
          ? "text-pink-700 dark:text-pink-200"
          : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white",
      )}
    >
      {active ? (
        <motion.span
          layoutId="desktop-nav-active"
          className="absolute inset-0 rounded-[1rem] border border-white/65 bg-white/62 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.08)] dark:border-white/10 dark:bg-white/9"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <Icon className="relative z-10 h-4 w-4 stroke-[1.9] transition-transform group-active:scale-90" />
      <span className="relative z-10 hidden lg:inline">{item.label}</span>
    </Link>
  );
}

function HeaderComponent() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden px-5 pt-4 md:block lg:px-8">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 rounded-[1.75rem] border border-white/60 bg-white/55 px-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_38px_rgba(71,40,62,.14)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-950/58">
        <Link
          href="/dashboard"
          aria-label="Love Notes — на головну"
          className="group flex min-w-0 items-center gap-2.5 rounded-[1rem] pr-2"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_7px_18px_rgba(207,49,112,.24)] transition-transform group-active:scale-95">
            <Heart className="h-[1.15rem] w-[1.15rem] fill-current" />
          </span>
          <span className="hidden min-w-0 xl:block">
            <span className="block truncate text-sm font-bold tracking-tight">Love Notes</span>
            <span className="block truncate text-[10px] text-muted-foreground">Щоденні слова кохання</span>
          </span>
        </Link>

        <nav aria-label="Основна навігація" className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {navigationItems.map((item) => (
            <NavigationLink
              key={item.href}
              item={item}
              active={
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/help"
            aria-label="Про застосунок"
            title="Про застосунок"
            className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/60 bg-white/42 text-pink-700 transition-all hover:bg-white/72 active:scale-90 dark:border-white/10 dark:bg-white/6 dark:text-pink-200 dark:hover:bg-white/10"
          >
            <Info className="h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export const DashboardHeader = memo(HeaderComponent);
