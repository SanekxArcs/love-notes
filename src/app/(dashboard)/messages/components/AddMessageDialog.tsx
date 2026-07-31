"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AddMessageDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: {
    text: string;
    category: string;
    isShown?: boolean;
    like?: boolean;
  }) => Promise<boolean>;
}

export default function AddMessageDialog({
  isOpen,
  setIsOpen,
  onSubmit,
}: AddMessageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uniquenessScore, setUniquenessScore] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState({
    text: "",
    category: "unknown",
    isShown: false,
    like: false,
  });

  const resetForm = () => {
    setNewMessage({
      text: "",
      category: "unknown",
      isShown: false,
      like: false,
    });
    setUniquenessScore(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/messages/generate", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Не вдалося згенерувати повідомлення");
        return;
      }

      setNewMessage((prev) => ({ ...prev, text: data.text }));
      setUniquenessScore(data.uniquenessScore);
    } catch (error) {
      console.error("Error generating AI message:", error);
      toast.error("Не вдалося згенерувати повідомлення");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.text.trim()) {
      alert("Будь ласка, введіть текст повідомлення");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmit({
        text: newMessage.text,
        category: newMessage.category,
        isShown: newMessage.isShown,
        like: newMessage.like
      });
      if (success) {
        resetForm();
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="col-span-1">
          <Plus className="mr-2 h-4 w-4" /> Додати
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Додати нове повідомлення</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">
              Категорія повідомлення
            </label>
            <Select
              value={newMessage.category}
              onValueChange={(value) =>
                setNewMessage({ ...newMessage, category: value })
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
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="text-sm font-medium">
                Текст повідомлення
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {isGenerating ? "Генерація..." : "Згенерувати AI"}
              </Button>
            </div>
            <Textarea
              id="message"
              value={newMessage.text}
              onChange={(e) => {
                setNewMessage({ ...newMessage, text: e.target.value });
                setUniquenessScore(null);
              }}
              rows={5}
              placeholder="Напишіть текст повідомлення..."
              className="resize-none"
              required
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {newMessage.text.length}/500 символів
              </p>
              {uniquenessScore !== null && (
                <p
                  className={`text-xs font-medium ${
                    uniquenessScore >= 70
                      ? "text-green-600"
                      : uniquenessScore >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  Унікальність: {uniquenessScore}%
                </p>
              )}
            </div>
          </div>

          {/* <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isShown"
                checked={newMessage.isShown || false}
                onCheckedChange={(checked) =>
                  setNewMessage({
                    ...newMessage,
                    isShown: checked === true,
                  })
                }
              />
              <label htmlFor="isShown" className="text-sm font-medium">
                Вже показано
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="like"
                checked={newMessage.like || false}
                onCheckedChange={(checked) =>
                  setNewMessage({ ...newMessage, like: checked === true })
                }
              />
              <label htmlFor="like" className="text-sm font-medium">
                Сподобалось
              </label>
            </div>
          </div> */}

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
              disabled={!newMessage.text.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  Збереження...
                </>
              ) : (
                "Зберегти повідомлення"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
