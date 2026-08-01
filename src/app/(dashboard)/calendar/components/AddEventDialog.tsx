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
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Додати подію
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Нова подія календаря</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <EventFormFields
            form={form}
            setForm={setForm}
            onTypeChange={handleTypeChange}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.date}>
              {isSubmitting ? "Збереження..." : "Додати подію"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
