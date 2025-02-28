"use client";

import { useState, useEffect } from "react";
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

export default function EditMessageDialog({ message, isOpen, setIsOpen, onSubmit }) {
  const [editingMessage, setEditingMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (message) {
      setEditingMessage({ ...message });
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingMessage?.text?.trim()) {
      alert("Будь ласка, введіть текст повідомлення");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(editingMessage);
      if (success) {
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редагувати повідомлення</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">
              Категорія повідомлення
            </label>
            <Select
              value={editingMessage?.category}
              onValueChange={(value) =>
                setEditingMessage({ ...editingMessage, category: value })
              }
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Виберіть категорію" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Невідома</SelectItem>
                <SelectItem value="daily">Щоденне повідомлення</SelectItem>
                <SelectItem value="extra">Додаткове повідомлення</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              Текст повідомлення
            </label>
            <Textarea
              id="message"
              value={editingMessage?.text}
              onChange={(e) =>
                setEditingMessage({ ...editingMessage, text: e.target.value })
              }
              rows={5}
              placeholder="Напишіть текст повідомлення..."
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              {editingMessage?.text?.length || 0}/500 символів
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-2">
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
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
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