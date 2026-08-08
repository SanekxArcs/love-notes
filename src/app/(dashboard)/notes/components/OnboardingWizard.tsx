"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { triggerConfetti } from "@/lib/confetti";
import { ONBOARDING_QUESTIONS } from "../data/onboarding-questions";
import type { NewPartnerNote, PartnerNote } from "../types";

interface OnboardingWizardProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingNotes: PartnerNote[];
  onNoteCreated: (note: PartnerNote) => void;
}

export default function OnboardingWizard({
  isOpen,
  setIsOpen,
  existingNotes,
  onNoteCreated,
}: OnboardingWizardProps) {
  const answeredIds = useMemo(
    () => new Set(existingNotes.map((note) => note.onboardingQuestionId).filter(Boolean)),
    [existingNotes]
  );
  const questions = useMemo(
    () => ONBOARDING_QUESTIONS.filter((q) => !answeredIds.has(q.id)),
    [answeredIds]
  );

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const question = questions[index];
  const total = questions.length;

  const advance = () => {
    setAnswer("");
    if (index + 1 >= total) {
      setIsDone(true);
      triggerConfetti();
    } else {
      setIndex(index + 1);
    }
  };

  const handleSkip = () => advance();

  const handleSave = async () => {
    if (!answer.trim() || !question) {
      advance();
      return;
    }

    const newNote: NewPartnerNote = {
      title: question.category,
      description: answer.trim(),
      tags: [question.tagHint],
      onboardingQuestionId: question.id,
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Не вдалося зберегти нотатку");
        return;
      }

      onNoteCreated(data.note);
      advance();
    } catch (error) {
      console.error("Error saving onboarding note:", error);
      toast.error("Не вдалося зберегти нотатку");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIndex(0);
      setAnswer("");
      setIsDone(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/82 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/86">
        <DialogHeader>
          <DialogTitle>Заповнимо перші нотатки</DialogTitle>
        </DialogHeader>

        {total === 0 || isDone ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-2xl">🎉</p>
            <p className="font-medium">
              {total === 0
                ? "Усі питання вже заповнені!"
                : "Готово! Перші нотатки збережено."}
            </p>
            <Button onClick={() => handleClose(false)} className="h-11 rounded-[1rem] bg-pink-600 px-5 text-white hover:bg-pink-500">Закрити</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-pink-100 dark:bg-pink-950/40">
              <div
                className="h-full rounded-full bg-pink-500 transition-all"
                style={{ width: `${((index) / total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Питання {index + 1} з {total}
            </p>

            <div className="grid gap-2">
              <p className="font-medium">{question.question}</p>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="min-h-28 resize-none rounded-[1rem] border-white/70 bg-white/52 px-4 py-3 focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
              >
                Завершити пізніше
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleSkip} className="rounded-[.9rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6">
                  Пропустити
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-[.9rem] bg-pink-600 text-white hover:bg-pink-500">
                  {isSaving ? "Збереження..." : "Далі"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
