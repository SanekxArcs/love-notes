"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDown,
  CalendarHeart,
  Heart,
  Mail,
  MailPlus,
  NotebookText,
  Phone,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_ACTION_EVENT,
  DASHBOARD_STATE_EVENT,
  type DashboardNavState,
} from "./mobile-nav-events";

const navItems = [
  { href: "/messages", label: "Написати", icon: MailPlus },
  { href: "/calendar", label: "Календар", icon: CalendarHeart },
  { href: "/notes", label: "Нотатки", icon: NotebookText },
  { href: "/profile", label: "Профіль", icon: UserRound },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: (typeof navItems)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-full transition-colors duration-300",
        active ? "text-pink-700 dark:text-pink-200" : "text-zinc-600 dark:text-zinc-300",
      )}
    >
      {active ? (
        <motion.span
          layoutId="mobile-nav-active"
          className="absolute inset-0 rounded-full bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_5px_14px_rgba(80,40,70,.08)] dark:bg-white/10"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <Icon className="relative z-10 h-[1.2rem] w-[1.2rem] stroke-[1.8] transition-transform group-active:scale-90" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

const MotionLink = motion.create(Link);

function ReceiveMessageIcon() {
  return (
    <span className="relative block h-9 w-9" aria-hidden="true">
      <motion.span
        className="absolute left-1/2 -top-2 -translate-x-1/2"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.35, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <ArrowDown className="h-[1.05rem] w-[1.05rem] stroke-[2.4]" />
      </motion.span>
      <Mail className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 stroke-[1.9]" />
    </span>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const [dashboardState, setDashboardState] = useState<DashboardNavState>({
    remainingTime: "--:--:--",
    canGetMessage: true,
    isLoading: true,
    contactNumber: "",
  });

  useEffect(() => {
    const handleState = (event: Event) => {
      setDashboardState((event as CustomEvent<DashboardNavState>).detail);
    };
    window.addEventListener(DASHBOARD_STATE_EVENT, handleState);
    return () => window.removeEventListener(DASHBOARD_STATE_EVENT, handleState);
  }, []);

  const visualState = !isDashboard
    ? "home"
    : dashboardState.isLoading
      ? "loading"
      : dashboardState.canGetMessage
        ? "receive"
        : "call";

  const shortRemainingTime = dashboardState.remainingTime.replace(/:\d{2}$/, "");

  const centerContent = (
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        key={visualState}
        className="flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.65, y: 8, filter: "blur(5px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.7, y: -8, filter: "blur(5px)" }}
        transition={{ type: "spring", stiffness: 430, damping: 30 }}
      >
        {visualState === "loading" ? (
          <motion.span
            animate={{ scale: [1, 1.16, 1] }}
            transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
          >
            <Heart className="h-6 w-6 fill-current" />
          </motion.span>
        ) : visualState === "receive" ? (
          <ReceiveMessageIcon />
        ) : visualState === "call" ? (
          <Phone className="h-6 w-6" />
        ) : (
          <Heart className="h-6 w-6 fill-current" />
        )}
      </motion.span>
    </AnimatePresence>
  );

  const centerLabel = isDashboard
    ? dashboardState.canGetMessage
      ? "Отримати повідомлення"
      : "Зателефонувати партнеру"
    : "На головну";

  const requestMessage = useCallback(() => {
    window.dispatchEvent(new Event(DASHBOARD_ACTION_EVENT));
  }, []);

  const centerClassName = cn(
    "relative z-20 flex h-[4.35rem] shrink-0 items-center justify-center overflow-hidden rounded-full text-white",
    "border border-white/60 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))]",
    "shadow-[inset_0_1px_1px_rgba(255,255,255,.75),inset_0_-10px_24px_rgba(139,15,71,.16),0_12px_30px_rgba(207,49,112,.34)]",
    "disabled:cursor-default",
  );

  const centerShape = {
    width: 69.6,
    borderRadius: 9999,
  };

  return (
    <nav
      aria-label="Основна навігація"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="mx-auto flex h-17 max-w-md items-center gap-1 rounded-full border border-white/60 bg-white/55 px-2 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_42px_rgba(71,40,62,.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-950/55">
        <div className="flex min-w-0 flex-1 items-center">
          {navItems.slice(0, 2).map((item) => (
            <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </div>

        {isDashboard ? (
          <div className="relative z-20 -mt-5 flex shrink-0 items-center">
            {!dashboardState.canGetMessage && !dashboardState.isLoading ? (
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-full border border-white/70 bg-white/75 px-2.5 py-1 font-mono text-[10px] font-bold tracking-tight text-pink-700 shadow-[0_5px_14px_rgba(71,40,62,.12)] backdrop-blur-xl dark:border-white/15 dark:bg-zinc-950/75 dark:text-pink-200">
                {shortRemainingTime || "--:--"}
              </span>
            ) : null}
            <motion.button
              type="button"
              aria-label={centerLabel}
              title={centerLabel}
              className={centerClassName}
              initial={centerShape}
              animate={centerShape}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              whileTap={{ scale: 0.94 }}
              disabled={
                dashboardState.isLoading ||
                (!dashboardState.canGetMessage && !dashboardState.contactNumber)
              }
              onClick={
                dashboardState.canGetMessage
                  ? requestMessage
                  : () => {
                      window.location.href = `tel:${dashboardState.contactNumber}`;
                    }
              }
            >
              {centerContent}
            </motion.button>
          </div>
        ) : (
          <MotionLink
            href="/dashboard"
            aria-label={centerLabel}
            title={centerLabel}
            className={cn(centerClassName, "-mt-5")}
            initial={centerShape}
            animate={centerShape}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            whileTap={{ scale: 0.94 }}
          >
            {centerContent}
          </MotionLink>
        )}

        <div className="flex min-w-0 flex-1 items-center">
          {navItems.slice(2).map((item) => (
            <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}
