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
import { Plus } from "lucide-react";

interface BatchAddDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: {
    messages: string[];
    category?: string;
    isShown?: boolean;
    like?: boolean;
  }) => Promise<boolean>;
}

export default function BatchAddDialog({ isOpen, setIsOpen, onSubmit }: BatchAddDialogProps) {
  const [batchMessages, setBatchMessages] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setBatchMessages("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Split the text by new lines and filter out empty lines
    const messageLines = batchMessages
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (messageLines.length === 0) {
      alert("Будь ласка, введіть хоча б одне повідомлення");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit({
        messages: messageLines,
        category: "unknown",
        isShown: false,
        like: false,
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
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Масове додавання
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Масове додавання повідомлень</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="batchMessages" className="text-sm font-medium">
              Текст повідомлень (кожне з нового рядка)
            </label>
            <Textarea
              id="batchMessages"
              value={batchMessages}
              onChange={(e) => setBatchMessages(e.target.value)}
              rows={10}
              placeholder="Введіть кожне повідомлення з нового рядка..."
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Всі повідомлення будуть додані з категорією &quot;unknown&quot;
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
              disabled={!batchMessages.trim() || isSubmitting}
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
