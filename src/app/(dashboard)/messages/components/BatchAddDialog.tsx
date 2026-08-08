"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, LoaderCircle } from "lucide-react";

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
  const batchMessagesId = useId();

  const resetForm = () => {
    setBatchMessages("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
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
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/80">
        <DialogHeader>
          <DialogTitle>Масове додавання повідомлень</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor={batchMessagesId} className="text-sm font-medium">
              Текст повідомлень (кожне з нового рядка)
            </label>
            <Textarea
              id={batchMessagesId}
              value={batchMessages}
              onChange={(e) => setBatchMessages(e.target.value)}
              rows={10}
              placeholder="Введіть кожне повідомлення з нового рядка..."
              className="max-h-[60svh] min-h-56 resize-none overflow-y-auto rounded-[1rem] border-white/70 bg-white/45 px-4 py-3 dark:border-white/10 dark:bg-white/6"
              required
            />
            <p className="text-xs text-gray-500">
              Всі повідомлення будуть додані з категорією &quot;unknown&quot;
            </p>
          </div>

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
              disabled={!batchMessages.trim() || isSubmitting}
              className="bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"
            >
              {isSubmitting ? (
                <>
                <Loader2 className="animate-spin" />
                Збереження...
              </>
              ) : (
                "Зберегти"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
