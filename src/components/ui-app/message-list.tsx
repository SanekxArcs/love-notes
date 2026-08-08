import { AnimatePresence, motion } from "framer-motion";
import { LoveMessageCard } from "./love-message-card";
import type { MessageWithKey } from "@/hooks/use-messages";

interface MessageListProps {
  title: string;
  messages: MessageWithKey[];
  isToday: boolean;
  onLikeChange: (id: string, liked: boolean) => void;
  animationDelay: number;
  isSettingsLoading?: boolean;
}

export function MessageList({
  title,
  messages,
  isToday,
  onLikeChange,
  animationDelay,
  isSettingsLoading,
}: MessageListProps) {
  // Nothing to show yet (and nothing loading) — skip rendering entirely so
  // the section doesn't leave behind an empty, margined gap on the page.
  if (!isSettingsLoading && messages.length === 0) {
    return null;
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="mb-6 grid gap-3"
    >
      {isSettingsLoading ? (
        <div className="h-5 w-40 animate-pulse rounded-full bg-pink-200/60 dark:bg-pink-900/40" />
      ) : (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationDelay }}
          className="flex items-center justify-between px-1"
        >
          <h2 className="text-[13px] font-semibold uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-300">
            {title}
          </h2>
          <span className="rounded-full border border-white/60 bg-white/50 px-2 py-0.5 text-[11px] font-semibold text-pink-700 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-pink-200">
            {messages.length}
          </span>
        </motion.div>
      )}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {isSettingsLoading ? (
            <motion.div
              key="message-skeleton"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animationDelay + 0.1 }}
              className="animate-pulse"
            >
              <div className="h-48 rounded-[1.75rem] border border-white/60 bg-white/45 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_30px_rgba(71,40,62,.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                <div className="mb-8 h-5 w-28 rounded-full bg-pink-200/60 dark:bg-pink-900/40" />
                <div className="mb-3 h-4 w-full rounded-full bg-pink-200/50 dark:bg-pink-900/30" />
                <div className="h-4 w-4/5 rounded-full bg-pink-200/50 dark:bg-pink-900/30" />
              </div>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
                <motion.div
                  key={msg._key}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: animationDelay + 0.1 + index * 0.1 }}
                >
                  <LoveMessageCard
                    id={msg._key}
                    message={msg.text}
                    date={msg.shownAt ? new Date(msg.shownAt) : undefined}
                    isToday={isToday}
                    isExtraMessage={msg.category === "extra"}
                    initialLikeState={msg.like}
                    onLikeChange={onLikeChange}
                  />
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
