"use client";

import { useMemo } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { uk } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../types";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const TYPE_ICON: Record<CalendarEvent["type"], string> = {
  important: "🎉",
  intimate: "💞",
  daily: "📝",
  message: "💌",
};

function eventDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function eventMonthDayKey(date: Date) {
  return format(date, "MM-dd");
}

function getEventsForDay(day: Date, events: CalendarEvent[]): CalendarEvent[] {
  const dayKey = eventDateKey(day);
  const dayMonthDay = eventMonthDayKey(day);

  return events.filter((event) => {
    if (!event.date) return false;
    if (event.isRecurringYearly) {
      return event.date.slice(5) === dayMonthDay;
    }
    return event.date === dayKey;
  });
}

interface CalendarViewProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
}

export default function CalendarView({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  events,
}: CalendarViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      className="rounded-[1.75rem] border border-white/60 bg-white/52 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.1)] backdrop-blur-2xl sm:p-4 dark:border-white/12 dark:bg-zinc-950/48"
    >
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(subMonths(month, 1))}
          aria-label="Попередній місяць"
          className="h-10 w-10 rounded-[1rem] border-white/65 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] dark:border-white/10 dark:bg-white/7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-base font-semibold capitalize tracking-tight">
          {format(month, "LLLL yyyy", { locale: uk })}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Наступний місяць"
          className="h-10 w-10 rounded-[1rem] border-white/65 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] dark:border-white/10 dark:bg-white/7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day, events);
          const isSelected = isSameDay(day, selectedDate);
          const isOutside = !isSameMonth(day, month);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative flex min-h-14 flex-col items-center gap-0.5 rounded-[.95rem] border border-transparent p-1.5 text-sm transition-all duration-200 hover:bg-white/55 dark:hover:bg-white/8",
                isOutside && "text-muted-foreground/50",
                isSelected &&
                  "border-pink-300/70 bg-[linear-gradient(145deg,rgba(255,236,245,.95),rgba(255,210,229,.74))] text-pink-950 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_5px_14px_rgba(212,62,123,.12)] dark:border-pink-400/30 dark:bg-[linear-gradient(145deg,rgba(131,24,67,.42),rgba(84,20,48,.35))] dark:text-pink-50",
                isToday(day) && !isSelected && "font-bold text-pink-600 dark:text-pink-300",
              )}
            >
              <span>{format(day, "d")}</span>
              {dayEvents.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event._key}
                      title={event.title || TYPE_ICON[event.type]}
                      className={cn(
                        "text-[0.62rem] leading-none",
                        event.isMine ? "opacity-100" : "opacity-60"
                      )}
                    >
                      {TYPE_ICON[event.type]}
                    </span>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[0.6rem] text-muted-foreground">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}

export { getEventsForDay };
