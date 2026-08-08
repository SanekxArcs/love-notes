"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "./TagInput";

export interface NoteFormValue {
  title: string;
  description: string;
  tags: string[];
}

interface NoteFormFieldsProps {
  form: NoteFormValue;
  setForm: (form: NoteFormValue) => void;
}

export default function NoteFormFields({ form, setForm }: NoteFormFieldsProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <div className="grid gap-2">
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

      <div className="grid gap-2">
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

      <div className="grid gap-2">
        <Label>Теги</Label>
        <TagInput
          value={form.tags}
          onChange={(tags) => setForm({ ...form, tags })}
        />
      </div>
    </>
  );
}
