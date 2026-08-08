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
    if (!event || !form?.date) return;

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
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/82">
        <DialogHeader>
          <DialogTitle>Редагувати подію</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2 [&_input]:rounded-[.9rem] [&_textarea]:rounded-[1rem]">
          <EventFormFields
            form={form}
            setForm={setForm}
            onTypeChange={handleTypeChange}
          />

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-11 rounded-[1rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.date}
              className="h-11 rounded-[1rem] bg-pink-600 text-white hover:bg-pink-500"
            >
              {isSubmitting ? "Збереження..." : "Зберегти зміни"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
