"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Compass, Lightbulb, LoaderCircle, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AiNoteGap } from "../types";

interface AiTopicDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onChoose: (topic: AiNoteGap) => void;
}

export default function AiTopicDialog({
  isOpen,
  setIsOpen,
  onChoose,
}: AiTopicDialogProps) {
  const [gaps, setGaps] = useState<AiNoteGap[]>([]);
  const [seenTopics, setSeenTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTopic = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notes/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excluded: seenTopics }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.gaps)) {
        toast.error(data.error || "Не вдалося знайти прогалини");
        return;
      }

      setGaps(data.gaps);
      setSeenTopics((previous) => [
        ...previous,
        ...data.gaps.map(
          (gap: AiNoteGap) => `${gap.title}: ${gap.question}`,
        ),
      ]);
    } catch (error) {
      console.error("Error loading AI note topic:", error);
      toast.error("Не вдалося знайти прогалини");
    } finally {
      setIsLoading(false);
    }
  }, [seenTopics]);

  useEffect(() => {
    if (isOpen && gaps.length === 0) void loadTopic();
  }, [isOpen, gaps.length, loadTopic]);

  const chooseTopic = (topic: AiNoteGap) => {
    onChoose(topic);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="h-11 w-full rounded-[1rem] border border-white/70 bg-white/45 px-3 text-xs dark:border-white/10 dark:bg-white/7"
        >
          <Lightbulb className="h-4 w-4" /> Нові теми
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/82 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/86">
        <DialogHeader className="text-left">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-[1.05rem] bg-amber-100 text-amber-700 shadow-[0_8px_20px_rgba(180,110,20,.14)] dark:bg-amber-950/45 dark:text-amber-200">
            <Lightbulb className="h-5 w-5" />
          </div>
          <DialogTitle>Чого ще бракує в нотатках</DialogTitle>
          <DialogDescription>
            AI бачить лише назви та теги ваших тем — не тексти відповідей — і шукає напрямки, яких ще бракує.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-amber-600 dark:text-amber-300" />
            <p className="text-sm text-muted-foreground">Шукаємо корисні прогалини…</p>
          </div>
        ) : gaps.length > 0 ? (
          <div className="grid gap-4">
            {gaps.map((gap) => (
              <article key={`${gap.area}-${gap.title}`} className="rounded-[1.35rem] border border-amber-200/70 bg-amber-50/55 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.88)] dark:border-amber-300/15 dark:bg-amber-950/18">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[.9rem] bg-amber-100 text-amber-700 dark:bg-amber-950/45 dark:text-amber-200"><Compass className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-200">{gap.area}</p>
                    <h3 className="mt-1 text-sm font-semibold">{gap.title}</h3>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{gap.reason}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{gap.question}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  {gap.tags.length > 0 ? <div className="flex flex-wrap gap-1.5">{gap.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div> : <span />}
                  <Button type="button" onClick={() => chooseTopic(gap)} className="h-9 shrink-0 rounded-[.85rem] bg-amber-600 px-3 text-xs text-white hover:bg-amber-500">Відповісти <ArrowRight className="h-3.5 w-3.5" /></Button>
                </div>
              </article>
            ))}
            <Button type="button" variant="outline" onClick={loadTopic} className="h-11 rounded-[1rem] border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/7">
              <RefreshCcw className="h-4 w-4" /> Показати інші напрямки
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Sparkles className="h-7 w-7 text-amber-600 dark:text-amber-300" />
            <p className="text-sm text-muted-foreground">AI ще не зміг знайти прогалини.</p>
            <Button type="button" onClick={loadTopic} className="rounded-[1rem] bg-amber-600 text-white hover:bg-amber-500">Спробувати знову</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
