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
    <div className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(subMonths(month, 1))}
          aria-label="Попередній місяць"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-medium capitalize">
          {format(month, "LLLL yyyy")}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Наступний місяць"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
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
                "flex min-h-14 flex-col items-center gap-0.5 rounded-md border border-transparent p-1 text-sm hover:bg-accent",
                isOutside && "text-muted-foreground/50",
                isSelected && "border-primary bg-accent",
                isToday(day) && !isSelected && "font-semibold text-primary"
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
                        "text-[0.65rem] leading-none",
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
    </div>
  );
}

export { getEventsForDay };
