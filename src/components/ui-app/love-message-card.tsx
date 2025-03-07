"use client";

import { useState, useEffect, useMemo } from "react";
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
  message: string;
  date: Date;
  isToday: boolean;
  isExtraMessage?: boolean;
  initialLikeState?: boolean;
  onLikeChange?: (id: string, liked: boolean) => void;
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

  function triggerConfetti() {
    // Make sure we're in a browser environment
    if (typeof window === "undefined") return;
    
    try {
      // Create heart shape
      const heart = confetti.shapeFromText({ text: '❤️' });
      
      // Fallback to default particles if shape creation fails
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 1.2 },
        shapes: ['circle', heart],
        colors: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB'],
        scalar: 1,
        gravity: 1.5,
        drift: 0,
        ticks: 200
      });
    } catch (error) {

      console.error("Failed to trigger confetti", error);
    }
  }

  useEffect(() => {
    setIsLiked(initialLikeState);
  }, [initialLikeState]);

  const handleLikeClick = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      triggerConfetti();
    }

    if (onLikeChange) {
      onLikeChange(id, newLikedState);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Card
        className={`overflow-hidden rounded-xl relative py-0 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900 dark:to-rose-950`}
      >
        {isLiked && <FloatingHearts />}

        <CardHeader className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 dark:from-pink-400 dark:via-rose-500 dark:to-purple-400 text-white py-3">
          <div className="relative flex items-center justify-between">
            <div className="text-sm font-medium flex items-center select-none  pointer-cursor">
              {isToday && (
                <Sparkles
                  size={16}
                  className="mr-1 text-yellow-100 animate-pulse"
                />
              )}
              {isToday
                ? "Сьогоднішнє повідомлення"
                : formatDistanceToNow(date, { addSuffix: true, locale: uk })}
            </div>
            {isExtraMessage && (
              <span className=" absolute  select-none  pointer-cursor -right-4 top-10 px-2 py-0.5 text-xs bg-red-500/50 uppercase scale-80 dark:bg-red-600/50 rounded-full flex items-center">
                <Star size={10} className="mr-1" /> Додаткове
                <Star size={10} className="ml-1" />
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 relative ">
          <div className="absolute -left-1 top-4 text-pink-200 rotate-12 opacity-30 dark:text-pink-900">
            <Heart size={32} fill="currentColor" />
          </div>
          <div className="absolute -right-1 bottom-2 text-pink-200 -rotate-12 opacity-30 dark:text-pink-900">
            <Heart size={32} fill="currentColor" />
          </div>

          <p
            className="text-lg leading-relaxed  select-none  pointer-cursor text-foreground relative z-10 font-medium"
            style={{
              // fontFamily: "Georgia, serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <span className="text-3xl text-pink-400 leading-none mr-1">
              &quot;
            </span>{message}
            
            <span className="text-3xl text-pink-400 leading-none ml-1">
              &quot;
            </span>
          </p>
        </CardContent>

        <CardFooter className="flex justify-between  py-3 px-6">
          <span className="text-xs text-muted-foreground  select-none  pointer-cursor">
            {date.toLocaleDateString("uk-UA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLikeClick}
            className="text-gray-600 cursor-pointer dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-100/50 dark:hover:bg-pink-900/30 rounded-full"
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
