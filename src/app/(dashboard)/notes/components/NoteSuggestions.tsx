"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb, LockKeyhole, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteSuggestion } from "../types";

interface NoteSuggestionsProps {
  suggestions: NoteSuggestion[];
  onAccept: (suggestion: NoteSuggestion) => void;
  onDismiss: (suggestion: NoteSuggestion) => void;
}

export default function NoteSuggestions({
  suggestions,
  onAccept,
  onDismiss,
}: NoteSuggestionsProps) {
  const [showAll, setShowAll] = useState(false);

  if (suggestions.length === 0) return null;

  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, 3);

  return (
    <section className="mb-4 overflow-hidden rounded-[1.6rem] border border-violet-200/65 bg-[linear-gradient(145deg,rgba(255,255,255,.62),rgba(245,238,255,.52))] p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_28px_rgba(86,55,130,.1)] backdrop-blur-2xl dark:border-violet-400/15 dark:bg-[linear-gradient(145deg,rgba(39,28,55,.58),rgba(24,20,34,.5))]">
      <div className="mb-3 flex items-start gap-3 px-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[.9rem] bg-violet-100 text-violet-700 dark:bg-violet-950/55 dark:text-violet-200">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Теми від партнера</h2>
            <span className="rounded-full bg-violet-100/80 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-200">
              {suggestions.length}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            Партнер записав щось приватне на ці теми. Ви можете відповісти своєю
            окремою нотаткою.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {visibleSuggestions.map((suggestion) => (
          <article
            key={suggestion.key}
            className="rounded-[1.15rem] border border-white/70 bg-white/52 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.88)] dark:border-white/10 dark:bg-white/6"
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-violet-700/75 dark:text-violet-200/75">
                  {suggestion.title}
                </p>
                <p className="mt-1 text-sm font-medium leading-5">
                  {suggestion.question}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <LockKeyhole className="h-3 w-3" /> Відповіді залишаються
                  приватними
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Приховати пропозицію"
                onClick={() => onDismiss(suggestion)}
                className="h-8 w-8 shrink-0 rounded-[.75rem] text-muted-foreground hover:bg-white/70 dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAccept(suggestion)}
              className="mt-3 h-9 w-full rounded-[.85rem] border-white/70 bg-white/55 text-xs text-violet-700 hover:bg-white/80 hover:text-violet-800 dark:border-white/10 dark:bg-white/7 dark:text-violet-200 dark:hover:bg-white/11 dark:hover:text-violet-100"
            >
              Створити свою нотатку <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </article>
        ))}
        {suggestions.length > 3 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAll((current) => !current)}
            className="h-9 rounded-[.85rem] text-xs text-violet-700 dark:text-violet-200"
          >
            {showAll ? "Згорнути" : `Показати ще ${suggestions.length - 3}`}
          </Button>
        )}
      </div>
    </section>
  );
}
