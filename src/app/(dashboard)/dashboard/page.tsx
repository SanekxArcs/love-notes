"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { SpinnerIcon } from "@sanity/icons/Spinner";
import { MessageList } from "@/components/ui-app/message-list";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useMessages } from "@/hooks/use-messages";
import { useCountdown } from "@/hooks/use-countdown";
import {
  DASHBOARD_ACTION_EVENT,
  DASHBOARD_STATE_EVENT,
  type DashboardNavState,
} from "@/components/dashboard/mobile-nav-events";
import { PageContainer } from "@/components/ui/page-container";

export default function Dashboard() {
  const { settings, isLoading: isSettingsLoading } = useUserSettings();

  const {
    todayMessages,
    previousMessages,
    messageCount,
    fetchMessages,
    getNewMessage,
    handleLikeChange,
    isLoading: isMessageLoading,
    noMessagesAvailable,
  } = useMessages(settings.partnerIdToReceiveFrom, settings.dailyMessageLimit);

  const remainingTime = useCountdown();
  const canGetMessage = messageCount < settings.dailyMessageLimit && !noMessagesAvailable;

  useEffect(() => {
    if (settings.partnerIdToReceiveFrom) {
      fetchMessages();
    }
  }, [settings.partnerIdToReceiveFrom, fetchMessages]);

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    return () => document.documentElement.classList.remove("hide-scrollbar");
  }, []);

  useEffect(() => {
    const handleMessageRequest = () => {
      if (canGetMessage && !isMessageLoading && !isSettingsLoading) {
        getNewMessage();
      }
    };

    window.addEventListener(DASHBOARD_ACTION_EVENT, handleMessageRequest);
    return () => window.removeEventListener(DASHBOARD_ACTION_EVENT, handleMessageRequest);
  }, [canGetMessage, getNewMessage, isMessageLoading, isSettingsLoading]);

  useEffect(() => {
    const detail: DashboardNavState = {
      remainingTime,
      canGetMessage,
      isLoading: isMessageLoading || isSettingsLoading,
    };
    window.dispatchEvent(new CustomEvent(DASHBOARD_STATE_EVENT, { detail }));
  }, [remainingTime, canGetMessage, isMessageLoading, isSettingsLoading]);

  return (
    <PageContainer className="relative">
      <MobileDashboardOverview
        messageCount={messageCount}
        dailyLimit={settings.dailyMessageLimit}
        canGetMessage={canGetMessage}
        noMessagesAvailable={noMessagesAvailable}
        isLoading={isMessageLoading || isSettingsLoading}
      />

      <div className="hidden md:block">
        <ControlPanel
          remainingTime={remainingTime}
          messageCount={messageCount}
          dailyLimit={settings.dailyMessageLimit}
          contactNumber={settings.contactNumber}
          onGetNewMessage={getNewMessage}
          isSettingsLoading={isSettingsLoading}
          isMessageLoading={isMessageLoading}
          noMessagesAvailable={noMessagesAvailable}
        />
      </div>

      <MessageList
        title="Сьогоднішні повідомлення"
        messages={todayMessages}
        isToday={true}
        onLikeChange={handleLikeChange}
        animationDelay={0.2}
        isSettingsLoading={isSettingsLoading}
      />

      <MessageList
        title="Історія повідомлень"
        messages={previousMessages}
        isToday={false}
        onLikeChange={handleLikeChange}
        animationDelay={0.5}
        isSettingsLoading={isSettingsLoading}
      />
    </PageContainer>
  );
}

interface MobileDashboardOverviewProps {
  messageCount: number;
  dailyLimit: number;
  canGetMessage: boolean;
  noMessagesAvailable: boolean;
  isLoading: boolean;
}

function MobileDashboardOverview({
  messageCount,
  dailyLimit,
  canGetMessage,
  noMessagesAvailable,
  isLoading,
}: MobileDashboardOverviewProps) {
  const progress = dailyLimit > 0 ? Math.min((messageCount / dailyLimit) * 100, 100) : 0;
  const status = isLoading
    ? "Збираємо твої листи…"
    : noMessagesAvailable
      ? "Усі листи вже з тобою"
      : canGetMessage
        ? "Для тебе є новий лист"
        : "На сьогодні це все 😢";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="mb-6 md:hidden"
    >
      <div className="mb-4 pr-12">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-pink-700 dark:text-pink-200">
          Love Notes
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-.03em] text-zinc-900 dark:text-white">
          Твоя любов сьогодні
        </h1>
      </div>

      <div className="rounded-[1.6rem] border border-white/60 bg-white/50 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_30px_rgba(71,40,62,.1)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 dark:bg-zinc-950/45">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,135,181,.95),rgba(225,52,118,.9))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_6px_16px_rgba(207,49,112,.24)]">
            <Heart className="h-[1.15rem] w-[1.15rem] fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {status}
              </p>
              <span className="shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {messageCount}/{dailyLimit}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-pink-100/80 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-pink-400 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

interface ControlPanelProps {
  remainingTime: string;
  messageCount: number;
  dailyLimit: number;
  contactNumber: string;
  isSettingsLoading?: boolean;
  isMessageLoading?: boolean;
  onGetNewMessage: () => void;
  noMessagesAvailable: boolean;
}

function ControlPanel({
  remainingTime,
  messageCount,
  dailyLimit,
  contactNumber,
  onGetNewMessage,
  isSettingsLoading,
  isMessageLoading,
  noMessagesAvailable,
}: ControlPanelProps) {
  const showCallButton = messageCount >= dailyLimit || noMessagesAvailable;
  const progress = dailyLimit > 0 ? Math.min((messageCount / dailyLimit) * 100, 100) : 0;
  const callPartner = useCallback(() => {
    window.location.href = `tel:${contactNumber}`;
  }, [contactNumber]);

  const status = noMessagesAvailable
    ? "Усі підготовлені листи вже прочитані"
    : showCallButton
      ? "На сьогодні це всі листи"
      : messageCount === 0
        ? "Для тебе є перший лист"
        : "Ще один лист чекає на тебе";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.12 }}
      className="mb-8"
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/52 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,.92),0_16px_46px_rgba(71,40,62,.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 dark:bg-zinc-950/48 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_9px_24px_rgba(207,49,112,.26)]">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-pink-700 dark:text-pink-200">
              Твоя любов сьогодні
            </p>
            <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight">{status}</h2>
          </div>
          <div className="rounded-full border border-white/65 bg-white/50 px-3 py-1.5 text-xs font-bold text-pink-700 dark:border-white/10 dark:bg-white/7 dark:text-pink-200">
            {messageCount}/{dailyLimit}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,19rem)]">
          <div className="rounded-[1.35rem] border border-white/60 bg-white/38 p-4 dark:border-white/10 dark:bg-white/5">
            {showCallButton ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-pink-600 dark:text-pink-300" />
                  <span className="text-xs font-semibold">Наступний лист через</span>
                </div>
                <span className="font-mono text-xl font-bold tracking-tight text-pink-700 dark:text-pink-200">
                  {remainingTime}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                <span>Отримано сьогодні</span>
                <span>{messageCount} з {dailyLimit}</span>
              </div>
            )}

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-pink-100/80 dark:bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                className="h-full rounded-full bg-linear-to-r from-pink-400 to-rose-500"
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {showCallButton
                ? "Новий щоденний ліміт відкриється завтра."
                : "Відкривай листи у своєму темпі — кожен з них лише для тебе."}
            </p>
          </div>

          <div className="flex min-h-32 items-stretch">
            {!showCallButton ? (
              <Button
                onClick={onGetNewMessage}
                size="lg"
                className="group h-auto w-full rounded-[1.35rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),inset_0_-12px_28px_rgba(139,15,71,.14),0_12px_28px_rgba(207,49,112,.26)] transition-all hover:brightness-105 active:scale-[.985]"
                disabled={isMessageLoading || isSettingsLoading}
              >
                {isSettingsLoading || isMessageLoading ? (
                  <span className="flex animate-pulse items-center gap-2">
                    <SpinnerIcon className="animate-spin" />
                    Готуємо лист…
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-2">
                    <Heart className="h-7 w-7 fill-current transition-transform group-hover:scale-110" />
                    <span className="text-base font-bold">
                      {messageCount < 1 ? "Відкрити перший лист" : "Отримати ще один лист"}
                    </span>
                  </span>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="h-auto w-full rounded-[1.35rem] border-white/65 bg-white/48 text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_9px_24px_rgba(71,40,62,.09)] hover:bg-white/75 hover:text-pink-700 dark:border-white/12 dark:bg-white/6 dark:text-pink-200 dark:hover:bg-white/10 dark:hover:text-pink-200"
                onClick={callPartner}
                disabled={isMessageLoading || isSettingsLoading || !contactNumber}
              >
                {isSettingsLoading ? (
                  <span className="flex animate-pulse items-center gap-2">
                    <SpinnerIcon className="animate-spin" />
                    Завантаження…
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-2">
                    <Phone className="h-6 w-6" />
                    <span className="text-sm font-bold">
                      {contactNumber ? "Зателефонувати партнеру" : "Додай номер у профілі"}
                    </span>
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
