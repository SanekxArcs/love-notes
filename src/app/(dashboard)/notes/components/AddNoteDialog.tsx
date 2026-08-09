"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NoteFormFields, { type NoteFormValue } from "./NoteFormFields";
import type { NewPartnerNote, NotePromptSuggestion } from "../types";

const EMPTY_FORM: NoteFormValue = {
  title: "",
  description: "",
  tags: [],
  confidence: "likely",
};

interface AddNoteDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: NewPartnerNote) => Promise<boolean>;
  availableTags?: string[];
  suggestion?: NotePromptSuggestion | null;
}

export default function AddNoteDialog({
  isOpen,
  setIsOpen,
  onSubmit,
  availableTags,
  suggestion,
}: AddNoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NoteFormValue>(EMPTY_FORM);

  const resetForm = () => setForm(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      suggestion
        ? {
            title: suggestion.title,
            description: "",
            tags: suggestion.tags,
            confidence: "likely",
          }
        : EMPTY_FORM,
    );
  }, [isOpen, suggestion]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        ...form,
        onboardingQuestionId: suggestion?.onboardingQuestionId,
        mirroredFromNoteKey: suggestion?.key,
      });
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
        <Button className="h-11 w-full rounded-[1rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] px-3 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.6),0_8px_20px_rgba(207,49,112,.22)] hover:brightness-105">
          <Plus className="h-4 w-4" /> Нова нотатка
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/82">
        <DialogHeader>
          <DialogTitle>
            {suggestion ? "Ваша нотатка на цю тему" : "Нова нотатка про партнера"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {suggestion ? (
            <div className="rounded-[1.15rem] border border-pink-200/65 bg-pink-50/45 p-3 dark:border-pink-400/15 dark:bg-pink-950/15">
              <p className="text-sm font-medium">{suggestion.question}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-4 text-muted-foreground">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
                Ваші відповіді залишаються приватними — партнер бачить лише тему.
              </p>
            </div>
          ) : null}
          <NoteFormFields
            form={form}
            setForm={setForm}
            availableTags={availableTags}
          />

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-11 rounded-[1rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6">
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
              className="h-11 rounded-[1rem] bg-pink-600 text-white hover:bg-pink-500"
            >
              {isSubmitting ? "Збереження..." : "Додати нотатку"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
