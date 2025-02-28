// components/ui/love-message-card.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface LoveMessageCardProps {
  message: string;
  date: Date;
  isToday: boolean;
  isExtraMessage?: boolean;
}

export function LoveMessageCard({
  message,
  date,
  isToday,
  isExtraMessage = false,
}: LoveMessageCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`overflow-hidden ${isToday ? "border-pink-400 shadow-lg bg-pink-300" : ""}`}
      >
        <CardHeader className="bg-gradient-to-r from-pink-400 to-rose-300 text-white">
          <div className="flex items-center justify-between py-1">
            <div className="text-sm font-medium">
              {isToday
                ? "Сьогоднішнє повідомлення"
                : formatDistanceToNow(date, { addSuffix: true, locale: uk })}
            </div>
            {isExtraMessage && (
              <span className="px-2 py-0.5 text-xs bg-red-500/50 rounded-full uppercase">
                Додаткове
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-lg italic leading-relaxed">
            &ldquo;{message}&rdquo;
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-xs ">
            {date.toLocaleDateString("uk-UA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLiked(!isLiked)}
            className="text-gray-600 hover:text-pink-500 hover:bg-pink-100"
          >
            <AnimatePresence>
              <motion.div
                key={isLiked ? "liked" : "notLiked"}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <Heart
                  className={isLiked ? "fill-pink-500 text-pink-500" : ""}
                  size={18}
                />
              </motion.div>
            </AnimatePresence>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
