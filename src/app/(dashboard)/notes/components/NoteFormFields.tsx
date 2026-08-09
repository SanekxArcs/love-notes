"use client";

import { useId } from "react";
import { Heart, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TagInput from "./TagInput";
import {
  NOTE_CONFIDENCE_OPTIONS,
  type NoteConfidence,
  NOTE_PERSPECTIVE_OPTIONS,
  type NotePerspective,
} from "../types";

export interface NoteFormValue {
  title: string;
  description: string;
  tags: string[];
  confidence: NoteConfidence;
  perspective: NotePerspective;
}

interface NoteFormFieldsProps {
  form: NoteFormValue;
  setForm: (form: NoteFormValue) => void;
  availableTags?: string[];
  lockPerspective?: boolean;
}

export default function NoteFormFields({
  form,
  setForm,
  availableTags,
  lockPerspective = false,
}: NoteFormFieldsProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confidenceId = useId();
  const perspectiveId = useId();

  return (
    <>
      <div className="grid min-w-0 gap-2">
        <Label id={perspectiveId}>Про кого ця нотатка?</Label>
        <ToggleGroup
          type="single"
          value={form.perspective}
          onValueChange={(perspective: NotePerspective) => {
            if (perspective) setForm({ ...form, perspective });
          }}
          aria-labelledby={perspectiveId}
          className="grid w-full grid-cols-2 overflow-hidden rounded-[1rem] border border-white/70 bg-white/45 p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,.8)] dark:border-white/12 dark:bg-white/6"
        >
          {NOTE_PERSPECTIVE_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              disabled={lockPerspective}
              className="h-10 gap-1.5 rounded-[.75rem] border-0 px-2 text-xs data-[state=on]:bg-pink-100 data-[state=on]:text-pink-800 data-[state=on]:shadow-sm dark:data-[state=on]:bg-pink-950/55 dark:data-[state=on]:text-pink-100"
            >
              {option.value === "partner" ? (
                <Heart className="h-3.5 w-3.5" />
              ) : (
                <UserRound className="h-3.5 w-3.5" />
              )}
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-[11px] leading-4 text-muted-foreground">
          {NOTE_PERSPECTIVE_OPTIONS.find(
            (option) => option.value === form.perspective,
          )?.description}
        </p>
      </div>

      <div className="grid min-w-0 gap-2">
        <Label htmlFor={titleId}>Заголовок</Label>
        <Input
          id={titleId}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Наприклад: Квіти, Музика, Розмір одягу..."
          required
          className="h-12 rounded-[1rem] border-white/70 bg-white/52 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
        />
      </div>

      <div className="grid min-w-0 gap-2">
        <Label htmlFor={descriptionId}>Опис</Label>
        <Textarea
          id={descriptionId}
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Деталі, які варто запам'ятати..."
          className="min-h-28 resize-none rounded-[1rem] border-white/70 bg-white/52 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
          required
        />
      </div>

      <div className="grid min-w-0 gap-2">
        <Label>Теги</Label>
        <TagInput
          value={form.tags}
          onChange={(tags) => setForm({ ...form, tags })}
          suggestions={availableTags}
        />
      </div>

      <div className="grid min-w-0 gap-2">
        <Label htmlFor={confidenceId}>Рівень впевненості</Label>
        <Select
          value={form.confidence}
          onValueChange={(confidence: NoteConfidence) =>
            setForm({ ...form, confidence })
          }
        >
          <SelectTrigger
            id={confidenceId}
            className="h-12 rounded-[1rem] border-white/70 bg-white/52 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] dark:border-white/12 dark:bg-white/7"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_CONFIDENCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] leading-4 text-muted-foreground">
          Видно лише тобі — партнер не бачить цей статус.
        </p>
      </div>
    </>
  );
}
