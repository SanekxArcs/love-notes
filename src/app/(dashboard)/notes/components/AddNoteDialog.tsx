"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NoteFormFields, { type NoteFormValue } from "./NoteFormFields";
import type { NewPartnerNote } from "../types";

const EMPTY_FORM: NoteFormValue = { title: "", description: "", tags: [] };

interface AddNoteDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: NewPartnerNote) => Promise<boolean>;
}

export default function AddNoteDialog({
  isOpen,
  setIsOpen,
  onSubmit,
}: AddNoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NoteFormValue>(EMPTY_FORM);

  const resetForm = () => setForm(EMPTY_FORM);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

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
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Додати нотатку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Нова нотатка про партнера</DialogTitle>
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
              {isSubmitting ? "Збереження..." : "Додати нотатку"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
