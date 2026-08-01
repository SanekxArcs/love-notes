"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NoteFormFields, { type NoteFormValue } from "./NoteFormFields";
import type { EditPartnerNotePayload, PartnerNote } from "../types";

interface EditNoteDialogProps {
  note: PartnerNote | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (key: string, data: EditPartnerNotePayload) => Promise<boolean>;
}

export default function EditNoteDialog({
  note,
  isOpen,
  setIsOpen,
  onSubmit,
}: EditNoteDialogProps) {
  const [form, setForm] = useState<NoteFormValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title,
        description: note.description,
        tags: note.tags ?? [],
      });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!note || !form || !form.title.trim() || !form.description.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(note._key, form);
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
          <DialogTitle>Редагувати нотатку</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <NoteFormFields form={form} setForm={setForm} />

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
            >
              {isSubmitting ? "Збереження..." : "Зберегти зміни"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
