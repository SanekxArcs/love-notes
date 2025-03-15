import { motion } from "framer-motion";
import { LoveMessageCard } from "./love-message-card";
import type { Message } from "@/sanity/types";

interface MessageListProps {
  title: string;
  messages: Message[];
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={`${isToday ? "mb-8" : "mb-6"} grid gap-4`}
    >
      {isSettingsLoading ? (
        <h2
          className={`${isToday ? "" : "mb-4"} text-xl text-transparent h-6 bg-pink-500/40  rounded w-3/4 mb-3 font-semibold`}
        >
          {title}
        </h2>
      ) : (
        messages.length > 0 && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay }}
            className={`${isToday ? "" : "mb-4"} text-xl font-semibold`}
          >
            {title}
          </motion.h2>
        )
      )}
      <div className={isToday ? "grid gap-4" : "grid gap-4"}>
        {isSettingsLoading
          ? Array(1)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: animationDelay + 0.1 + index * 0.1 }}
                  className="animate-pulse"
                >
                  <div
                    className={`bg-pink-500/40  rounded-lg p-4 ${isToday ? "h-60" : "h-60"}`}
                  >
                    <div className="h-4 bg-pink-500/40  rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-pink-500/40  rounded w-full mb-2"></div>
                    <div className="h-3 bg-pink-500/40  rounded w-5/6"></div>
                    {isToday && (
                      <div className="flex justify-end mt-4">
                        <div className="h-6 w-6 bg-pink-500/40  rounded-full"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
          : messages.map((msg, index) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: animationDelay + 0.1 + index * 0.1 }}
              >
                <LoveMessageCard
                  id={msg._id}
                  message={msg.text}
                  date={msg.shownAt}
                  isToday={isToday}
                  isExtraMessage={msg.category === "extra"}
                  initialLikeState={msg.like}
                  onLikeChange={onLikeChange}
                />
              </motion.div>
            ))}
      </div>
    </motion.div>
  );
}
