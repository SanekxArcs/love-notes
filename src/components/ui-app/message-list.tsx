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
}

export function MessageList({
  title,
  messages,
  isToday,
  onLikeChange,
  animationDelay
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
        {messages.map((msg, index) => (
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
