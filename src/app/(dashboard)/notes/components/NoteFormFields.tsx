"use client";

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
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="note-title">Заголовок</Label>
        <Input
          id="note-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Наприклад: Квіти, Музика, Розмір одягу..."
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note-description">Опис</Label>
        <Textarea
          id="note-description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Деталі, які варто запам'ятати..."
          className="resize-none"
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
