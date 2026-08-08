"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarHeart, Heart, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";
import { PageContainer } from "@/components/ui/page-container";
import CalendarView, { getEventsForDay } from "./components/CalendarView";
import DayEventsPanel from "./components/DayEventsPanel";
import AddEventDialog from "./components/AddEventDialog";
import EditEventDialog from "./components/EditEventDialog";
import DeleteEventDialog from "./components/DeleteEventDialog";
import type { CalendarEvent, NewCalendarEvent } from "./types";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/calendar/events");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося завантажити події");
      }

      setEvents(data.events ?? []);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      toast.error("Не вдалося завантажити події календаря");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = async (data: NewCalendarEvent): Promise<boolean> => {
    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(`Помилка: ${result.error || "Не вдалося додати подію"}`);
        return false;
      }

      setEvents((prev) => [result.event, ...prev]);
      toast.success("Подію успішно додано!");
      return true;
    } catch (error) {
      console.error("Error adding calendar event:", error);
      toast.error("Сталася помилка під час додавання події");
      return false;
    }
  };

  const handleEditEvent = async (
    key: string,
    data: NewCalendarEvent,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/calendar/events?key=${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(`Помилка: ${result.error || "Не вдалося оновити подію"}`);
        return false;
      }

      setEvents((prev) =>
        prev.map((event) =>
          event._key === key ? { ...event, ...result.event } : event,
        ),
      );
      toast.success("Подію успішно оновлено!");
      setEditingEvent(null);
      return true;
    } catch (error) {
      console.error("Error updating calendar event:", error);
      toast.error("Сталася помилка під час оновлення події");
      return false;
    }
  };

  const handleDeleteEvent = async (): Promise<boolean> => {
    if (!deletingEvent) return false;

    try {
      const response = await fetch(
        `/api/calendar/events?key=${deletingEvent._key}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const result = await response.json();
        toast.error(`Помилка: ${result.error || "Не вдалося видалити подію"}`);
        return false;
      }

      setEvents((prev) => prev.filter((event) => event._key !== deletingEvent._key));
      toast.success("Подію успішно видалено!");
      setDeletingEvent(null);
      return true;
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      toast.error("Сталася помилка під час видалення події");
      return false;
    }
  };

  const selectedDayEvents = useMemo(
    () => getEventsForDay(selectedDate, events),
    [selectedDate, events],
  );

  return (
    <PageContainer size="default">
      <BackButton text="Спільний календар" />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="mb-4 rounded-[1.75rem] border border-white/60 bg-white/52 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.1)] backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/48"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_8px_20px_rgba(207,49,112,.24)]">
            <CalendarHeart className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight">Наші особливі дні</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Спільні події, моменти та маленькі спогади
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[1rem] border border-white/60 bg-white/45 px-3 text-sm font-semibold dark:border-white/10 dark:bg-white/6">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
            <span>{events.length} {events.length === 1 ? "подія" : "подій"}</span>
          </div>
          <AddEventDialog
            isOpen={isAddOpen}
            setIsOpen={setIsAddOpen}
            onSubmit={handleAddEvent}
            defaultDate={selectedDate}
          />
        </div>
      </motion.section>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-[1.75rem] border border-white/60 bg-white/45 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <LoaderCircle className="h-7 w-7 animate-spin text-pink-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <DayEventsPanel
            date={selectedDate}
            events={selectedDayEvents}
            onEdit={setEditingEvent}
            onDelete={setDeletingEvent}
          />
          <CalendarView
            month={month}
            onMonthChange={setMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            events={events}
          />
        </div>
      )}

      <EditEventDialog
        event={editingEvent}
        isOpen={Boolean(editingEvent)}
        setIsOpen={(open) => {
          if (!open) setEditingEvent(null);
        }}
        onSubmit={handleEditEvent}
      />

      <DeleteEventDialog
        event={deletingEvent}
        isOpen={Boolean(deletingEvent)}
        setIsOpen={(open) => {
          if (!open) setDeletingEvent(null);
        }}
        onConfirm={handleDeleteEvent}
      />
    </PageContainer>
  );
}
