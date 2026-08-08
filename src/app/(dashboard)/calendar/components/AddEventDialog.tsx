"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EventFormFields from "./EventFormFields";
import type { CalendarEventType, NewCalendarEvent } from "../types";

const EMPTY_FORM: NewCalendarEvent = {
  type: "important",
  title: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "",
  durationMinutes: undefined,
  isRecurringYearly: false,
  mood: undefined,
  note: "",
  activities: undefined,
  initiatedBy: undefined,
  selfFinished: undefined,
  partnerFinished: undefined,
  protectionUsed: false,
  protectionType: undefined,
  rating: undefined,
  highlights: undefined,
};

interface AddEventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: NewCalendarEvent) => Promise<boolean>;
  defaultDate?: Date;
}

export default function AddEventDialog({
  isOpen,
  setIsOpen,
  onSubmit,
  defaultDate,
}: AddEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NewCalendarEvent>(EMPTY_FORM);

  const resetForm = () =>
    setForm({
      ...EMPTY_FORM,
      date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : EMPTY_FORM.date,
    });

  const handleTypeChange = (type: CalendarEventType) => {
    setForm((prev) => ({ ...EMPTY_FORM, date: prev.date, type }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.date) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(form);
      if (success) {
        resetForm();
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setForm({
            ...EMPTY_FORM,
            date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : EMPTY_FORM.date,
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-11 shrink-0 rounded-[1rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] px-4 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.6),0_8px_20px_rgba(207,49,112,.22)] hover:brightness-105">
          <Plus className="h-4 w-4" /> Додати
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/82">
        <DialogHeader>
          <DialogTitle>Нова подія календаря</DialogTitle>
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
              {isSubmitting ? "Збереження..." : "Додати подію"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
