"use client";

import { useState, useEffect, useId, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Message, EditMessagePayload } from "../types";
import SpecificDateField from "./SpecificDateField";
import { Loader2 } from "lucide-react";

interface EditMessageDialogProps {
  message: Message | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (message: EditMessagePayload) => Promise<boolean>;
}

export default function EditMessageDialog({ message, isOpen, setIsOpen, onSubmit }: EditMessageDialogProps) {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const editCategoryId = useId();
  const editMessageId = useId();

  useEffect(() => {
    if (message) {
      setEditingMessage({ ...message });
    }
  }, [message]);

  const handleCategoryChange = (value: string) => {
    if (!editingMessage) return;
    
    const category = (value as "daily" | "extra" | "unknown");
    
    setEditingMessage({
      ...editingMessage,
      category
    });
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editingMessage) return;

    setEditingMessage({
      ...editingMessage,
      text: e.target.value
    });
  };

  const handleSpecificDateChange = (specificDate: string) => {
    if (!editingMessage) return;

    setEditingMessage({
      ...editingMessage,
      specificDate,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editingMessage?.text?.trim()) {
      alert("Будь ласка, введіть текст повідомлення");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingMessage) {
        // Include the required fields: _key, text, and category
        const payload: EditMessagePayload = {
          _key: editingMessage._key,
          text: editingMessage.text,
          category: editingMessage.category,
          specificDate: editingMessage.specificDate || undefined,
        };
        
        const success = await onSubmit(payload);
        if (success) {
          setIsOpen(false);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/80">
        <DialogHeader>
          <DialogTitle>Редагувати повідомлення</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label htmlFor={editCategoryId} className="text-sm font-medium">
              Категорія повідомлення
            </label>
            <Select
              value={editingMessage?.category || "unknown"}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger id={editCategoryId} className="h-11 w-full rounded-[1rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6">
                <SelectValue placeholder="Виберіть категорію" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Повідомлення</SelectItem>
                <SelectItem value="daily">Щоденне повідомлення</SelectItem>
                <SelectItem value="extra">Додаткове повідомлення</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor={editMessageId} className="text-sm font-medium">
              Текст повідомлення
            </label>
            <Textarea
              id={editMessageId}
              value={editingMessage?.text || ""}
              onChange={handleTextChange}
              rows={5}
              placeholder="Напишіть текст повідомлення..."
              className="min-h-36 resize-none rounded-[1rem] border-white/70 bg-white/45 px-4 py-3 dark:border-white/10 dark:bg-white/6"
              required
            />
            <p className="text-xs text-gray-500">
              {editingMessage?.text?.length || 0}/500 символів
            </p>
          </div>

          <SpecificDateField
            value={editingMessage?.specificDate || ""}
            onChange={handleSpecificDateChange}
          />

          <div className="mt-2 grid grid-cols-2 gap-2 [&_button]:rounded-[.9rem]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"
            >
              {isSubmitting ? (
                <>
                <Loader2 className="animate-spin" />
                Збереження...
              </>
              ) : (
                "Зберегти зміни"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
