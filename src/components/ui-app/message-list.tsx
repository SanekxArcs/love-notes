import { motion } from "framer-motion";
import { LoveMessageCard } from "./love-message-card";

interface Message {
  _id: string;
  text: string;
  category: "daily" | "extra" | "unknown";
  like: boolean;
  lastShownAt: Date;
}

interface MessageListProps {
  title: string;
  messages: Message[];
  isToday: boolean;
  onLikeChange: (id: string, liked: boolean) => void;
  animationDelay: number;
  loading?: boolean; // Added loading prop
}

export function MessageList({
  title,
  messages,
  isToday,
  onLikeChange,
  animationDelay,
  loading = false // Default to false
}: MessageListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={`${isToday ? "mb-8" : "mb-6"} grid gap-4`}
    >
      <h2 className={`${isToday ? "" : "mb-4"} text-xl font-semibold`}>
        {title}
      </h2>

      <div className={isToday ? "grid gap-4" : "grid gap-4"}>
        {loading
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
                    className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${isToday ? "h-60" : "h-60"}`}
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    {isToday && (
                      <div className="flex justify-end mt-4">
                        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
                  date={msg.lastShownAt}
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
