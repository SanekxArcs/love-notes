"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";
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

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
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
  }

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
    data: NewCalendarEvent
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
          event._key === key ? { ...event, ...result.event } : event
        )
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
        { method: "DELETE" }
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
    [selectedDate, events]
  );

  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-6 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <BackButton text="Спільний календар" />
        <AddEventDialog
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          onSubmit={handleAddEvent}
          defaultDate={selectedDate}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Завантаження...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CalendarView
            month={month}
            onMonthChange={setMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            events={events}
          />
          <DayEventsPanel
            date={selectedDate}
            events={selectedDayEvents}
            onEdit={setEditingEvent}
            onDelete={setDeletingEvent}
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
    </div>
  );
}
