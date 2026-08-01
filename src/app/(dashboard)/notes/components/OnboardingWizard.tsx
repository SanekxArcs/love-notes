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
      <DialogContent className="sm:max-w-md">
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
            <Button onClick={() => handleClose(false)}>Закрити</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
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
                className="resize-none"
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
                <Button type="button" variant="outline" onClick={handleSkip}>
                  Пропустити
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
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
