"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import confetti from "canvas-confetti";

// Animated floating hearts background element
const FloatingHearts = ({ count = 8 }: { count?: number }) => {
  // Create stable positions for hearts using useMemo
  const hearts = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      id: `heart-${i}`,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 + 50,
      scale: Math.random() * 0.5 + 0.5,
      rotate: Math.random() * 30 - 15,
      left: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 7,
      delay: Math.random() * 5,
      size: i % 2 ? 16 : 12,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400 dark:text-pink-500 opacity-50"
          initial={{
            x: heart.x,
            y: heart.y,
            scale: heart.scale,
            rotate: heart.rotate,
          }}
          animate={{
            y: [null, -100, -200],
            opacity: [0.4, 0.7, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: heart.duration,
            delay: heart.delay,
            ease: "easeInOut",
          }}
          style={{
            left: heart.left,
          }}
        >
          <Heart fill="currentColor" size={heart.size} />
        </motion.div>
      ))}
    </div>
  );
};

interface LoveMessageCardProps {
  id: string;
  message?: string;
  date?: Date;
  isToday: boolean;
  isExtraMessage?: boolean;
  initialLikeState?: boolean;
  onLikeChange?: (id: string, liked: boolean) => void;
}

function triggerConfetti() {
  if (typeof window === "undefined") return;

  try {
    const heart = confetti.shapeFromText({ text: "❤️" });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 1.2 },
      shapes: ["circle", heart],
      colors: ["#FF1493", "#FF69B4", "#FFB6C1", "#FFC0CB"],
      scalar: 1,
      gravity: 1.5,
      drift: 0,
      ticks: 200,
    });
  } catch (error) {
    console.error("Failed to trigger confetti", error);
  }
}

export function LoveMessageCard({
  id,
  message,
  date,
  isToday,
  isExtraMessage = false,
  initialLikeState = false,
  onLikeChange,
}: LoveMessageCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(initialLikeState);

  useEffect(() => {
    setIsLiked(initialLikeState);
  }, [initialLikeState]);

  const handleLikeClick = useCallback(async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      triggerConfetti();
    }

    if (onLikeChange) {
      onLikeChange(id, newLikedState);
    }
  }, [id, isLiked, onLikeChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      whileTap={{ scale: 0.985 }}
      className="relative"
    >
      <Card
        className="relative gap-0 overflow-hidden rounded-[1.75rem] border border-white/65 bg-white/55 py-0 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 dark:bg-zinc-950/50"
      >
        {isLiked ? <FloatingHearts count={5} /> : null}

        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-pink-300/25 blur-3xl dark:bg-pink-700/15" />

        <CardHeader className="px-5 pt-4 pb-0">
          <div className="relative flex items-center justify-between">
            <div className="flex select-none items-center text-xs font-semibold text-pink-700 dark:text-pink-200">
              {isToday ? <Sparkles size={14} className="mr-1.5" /> : null}
              {isToday
                  ? "Сьогоднішнє повідомлення"
                  : date ? formatDistanceToNow(date, { addSuffix: true, locale: uk }) : ""}
            </div>
            {isExtraMessage ? (
              <span className="flex select-none items-center rounded-full border border-pink-200/70 bg-pink-100/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pink-700 dark:border-pink-800/50 dark:bg-pink-900/35 dark:text-pink-200">
                <Star size={10} className="mr-1 fill-current" /> Додаткове
              </span>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="relative px-5 pt-5 pb-4">
          <p className="relative z-10 select-none text-[1.05rem] font-medium leading-7 tracking-[-.01em] text-zinc-800 dark:text-zinc-100">
            <span className="mr-1 text-2xl leading-none text-pink-400/80">“</span>
            {message}
            <span className="ml-1 text-2xl leading-none text-pink-400/80">”</span>
          </p>
        </CardContent>

        <CardFooter className="flex justify-between px-5 pt-0 pb-4">
          <span className="select-none text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {date?.toLocaleDateString("uk-UA", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLikeClick}
            aria-label={isLiked ? "Прибрати вподобання" : "Вподобати повідомлення"}
            className="h-10 w-10 cursor-pointer rounded-[1rem] border border-white/70 bg-white/50 text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,.85),0_4px_12px_rgba(71,40,62,.08)] hover:bg-pink-50 hover:text-pink-500 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-pink-900/25 dark:hover:text-pink-300"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isLiked ? "liked" : "notLiked"}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isLiked ? [1, 1.3, 1] : 1,
                  rotate: isLiked ? [-5, 5, -5, 5, 0] : 0,
                }}
                transition={{
                  duration: isLiked ? 0.5 : 0.2,
                  times: isLiked ? [0, 0.2, 0.5, 0.8, 1] : [0, 1],
                }}
                exit={{ scale: 0.8 }}
              >
                <Heart
                  className={
                    isLiked
                      ? "fill-pink-500 dark:fill-pink-400 text-pink-500 dark:text-pink-400"
                      : ""
                  }
                  size={22}
                />
              </motion.div>
            </AnimatePresence>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
