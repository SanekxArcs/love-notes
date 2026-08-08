"use client";

import { type PointerEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

function normalized(tag: string) {
  return tag.trim().toLocaleLowerCase("uk");
}

function keepInputFocused(event: PointerEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export default function TagInput({
  value,
  onChange,
  suggestions = [],
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const tag = draft.trim();
    setDraft("");
    if (!tag || value.some((existing) => normalized(existing) === normalized(tag))) return;
    onChange([...value, tag]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const toggleSuggestion = (tag: string) => {
    const selectedTag = value.find(
      (existing) => normalized(existing) === normalized(tag),
    );
    if (selectedTag) {
      removeTag(selectedTag);
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 border border-pink-200/70 bg-pink-50 text-pink-700 dark:border-pink-400/20 dark:bg-pink-950/35 dark:text-pink-200">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Видалити тег ${tag}`}
              className="rounded-full hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "Backspace" && !draft && value.length > 0) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={commitDraft}
        placeholder="Додай тег і натисни Enter..."
        className="h-12 rounded-[1rem] border-white/70 bg-white/52 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
      />
      {suggestions.length > 0 ? (
        <div className="grid gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
            Швидкий вибір
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((tag) => {
              const isSelected = value.some(
                (existing) => normalized(existing) === normalized(tag),
              );
              return (
                <button
                  key={normalized(tag)}
                  type="button"
                  onPointerDown={keepInputFocused}
                  onClick={() => toggleSuggestion(tag)}
                  aria-pressed={isSelected}
                  className={`inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${isSelected ? "border-pink-300/70 bg-pink-100 text-pink-700 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-pink-400/25 dark:bg-pink-950/45 dark:text-pink-200" : "border-white/70 bg-white/45 text-zinc-600 hover:border-pink-200 hover:bg-pink-50/70 hover:text-pink-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-pink-400/20 dark:hover:bg-pink-950/25 dark:hover:text-pink-200"}`}
                >
                  {isSelected ? <Check className="h-3 w-3" /> : null}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
