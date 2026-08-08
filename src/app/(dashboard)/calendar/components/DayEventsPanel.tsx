"use client";

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Pencil, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_OPTIONS,
  HIGHLIGHT_OPTIONS,
  MOOD_OPTIONS,
  PROTECTION_OPTIONS,
  type CalendarEvent,
} from "../types";

const TYPE_LABEL: Record<CalendarEvent["type"], string> = {
  important: "🎉 Важлива подія",
  intimate: "💞 Інтимний момент",
  daily: "📝 Щоденний момент",
  message: "💌 Повідомлення від партнера",
};

const INITIATED_LABEL: Record<NonNullable<CalendarEvent["initiatedBy"]>, string> = {
  me: "ініціював(ла) власник запису",
  partner: "ініціював(ла) партнер",
  mutual: "ініціювали обоє",
};

function optionLabel<T extends string>(
  options: { value: T; label: string }[],
  value?: T
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function eventDetails(event: CalendarEvent): string[] {
  const details: string[] = [];

  if (event.type === "intimate") {
    if (event.activities?.length) {
      details.push(
        event.activities.map((a) => optionLabel(ACTIVITY_OPTIONS, a)).join(", ")
      );
    }
    if (event.durationMinutes) details.push(`⏱ ${event.durationMinutes} хв`);
    if (event.initiatedBy) details.push(INITIATED_LABEL[event.initiatedBy]);
    if (event.protectionUsed) {
      details.push(
        `🛡️ ${event.protectionType ? optionLabel(PROTECTION_OPTIONS, event.protectionType) : "Захист використано"}`
      );
    }
    if (event.highlights?.length) {
      details.push(
        event.highlights.map((h) => optionLabel(HIGHLIGHT_OPTIONS, h)).join(", ")
      );
    }
  }

  if (event.mood) {
    details.push(`Настрій: ${optionLabel(MOOD_OPTIONS, event.mood)}`);
  }

  return details;
}

function ratingIcons(rating: number) {
  const stars = "⭐".repeat(Math.min(rating, 5));
  const flames = "🔥".repeat(Math.max(rating - 5, 0));
  return `${stars}${flames}`;
}

interface DayEventsPanelProps {
  date: Date;
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

export default function DayEventsPanel({
  date,
  events,
  onEdit,
  onDelete,
}: DayEventsPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-[1.75rem] border border-white/60 bg-white/52 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.1)] backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/48"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-pink-200/70 bg-pink-50/65 text-pink-700 dark:border-pink-400/20 dark:bg-pink-950/30 dark:text-pink-200">
          <CalendarDays className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Обраний день</p>
          <h2 className="text-base font-semibold capitalize tracking-tight">
            {format(date, "d MMMM yyyy", { locale: uk })}
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-pink-200/80 bg-pink-50/25 px-6 text-center dark:border-pink-400/20 dark:bg-pink-950/10">
            <Sparkles className="mb-2 h-5 w-5 text-pink-400" />
            <p className="text-sm font-semibold">Цей день поки вільний</p>
            <p className="mt-1 text-xs text-muted-foreground">Можна додати новий спільний момент</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event, index) => (
            <motion.article
              key={event._key}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: index * 0.035 }}
              className="flex flex-col gap-2 rounded-[1.35rem] border border-white/65 bg-white/48 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,.85),0_7px_20px_rgba(71,40,62,.07)] dark:border-white/10 dark:bg-white/6"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {event.title || TYPE_LABEL[event.type]}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Boolean(event.title) && (
                      <Badge variant="secondary">{TYPE_LABEL[event.type]}</Badge>
                    )}
                    <Badge variant="outline">
                      {event.isMine ? "Мій запис" : event.ownerName || "Партнер"}
                    </Badge>
                    {Boolean(event.isRecurringYearly) && (
                      <Badge variant="outline">Щороку</Badge>
                    )}
                    {Boolean(event.time) && <Badge variant="outline">{event.time}</Badge>}
                  </div>
                </div>
                {Boolean(event.isMine) && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(event)}
                      aria-label="Редагувати подію"
                      className="h-9 w-9 rounded-[.9rem] bg-white/45 hover:bg-white/75 dark:bg-white/5"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(event)}
                      aria-label="Видалити подію"
                      className="h-9 w-9 rounded-[.9rem] text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {Boolean(
                event.rating || event.selfFinished || event.partnerFinished
              ) && (
                <div className="flex flex-wrap items-center gap-2">
                  {Boolean(event.rating) && (
                    <span className="text-sm">
                      {ratingIcons(event.rating as number)}
                    </span>
                  )}
                  {Boolean(event.selfFinished) && (
                    <Badge variant="outline">💖 Я</Badge>
                  )}
                  {Boolean(event.partnerFinished) && (
                    <Badge variant="outline">💖 Партнер</Badge>
                  )}
                </div>
              )}

              {eventDetails(event).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {eventDetails(event).join(" · ")}
                </p>
              )}

              {Boolean(event.note) && <p className="text-sm">{event.note}</p>}
            </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
}
