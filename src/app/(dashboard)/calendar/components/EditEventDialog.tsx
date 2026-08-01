"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EventFormFields from "./EventFormFields";
import type {
  CalendarEvent,
  CalendarEventType,
  NewCalendarEvent,
} from "../types";

interface EditEventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (key: string, data: NewCalendarEvent) => Promise<boolean>;
}

export default function EditEventDialog({
  event,
  isOpen,
  setIsOpen,
  onSubmit,
}: EditEventDialogProps) {
  const [form, setForm] = useState<NewCalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({ ...event });
    }
  }, [event]);

  const handleTypeChange = (type: CalendarEventType) => {
    if (!form) return;
    setForm({ ...form, type });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event || !form || !form.date) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(event._key, form);
      if (success) setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Редагувати подію</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <EventFormFields
            form={form}
            setForm={setForm}
            onTypeChange={handleTypeChange}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.date}>
              {isSubmitting ? "Збереження..." : "Зберегти зміни"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
