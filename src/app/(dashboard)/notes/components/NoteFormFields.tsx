"use client";

import { useId } from "react";
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
import TagInput from "./TagInput";
import {
  NOTE_CONFIDENCE_OPTIONS,
  type NoteConfidence,
} from "../types";

export interface NoteFormValue {
  title: string;
  description: string;
  tags: string[];
  confidence: NoteConfidence;
}

interface NoteFormFieldsProps {
  form: NoteFormValue;
  setForm: (form: NoteFormValue) => void;
  availableTags?: string[];
}

export default function NoteFormFields({
  form,
  setForm,
  availableTags,
}: NoteFormFieldsProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confidenceId = useId();

  return (
    <>
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
