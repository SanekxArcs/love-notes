"use client";

import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          {format(date, "d MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            У цей день немає жодних подій.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event._key}
              className="flex flex-col gap-1.5 rounded-md border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {event.title || TYPE_LABEL[event.type]}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{TYPE_LABEL[event.type]}</Badge>
                    <Badge variant="outline">
                      {event.isMine ? "Мій запис" : event.ownerName || "Партнер"}
                    </Badge>
                    {event.isRecurringYearly && (
                      <Badge variant="outline">Щороку</Badge>
                    )}
                    {event.time && <Badge variant="outline">{event.time}</Badge>}
                  </div>
                </div>
                {event.isMine && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(event)}
                      aria-label="Редагувати подію"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(event)}
                      aria-label="Видалити подію"
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

              {event.note && <p className="text-sm">{event.note}</p>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
