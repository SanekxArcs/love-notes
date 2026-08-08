"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const tag = draft.trim();
    setDraft("");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
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
    </div>
  );
}
