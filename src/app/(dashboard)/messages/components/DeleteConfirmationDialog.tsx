"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Message } from "../types";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  message: Message | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => Promise<boolean>;
}

export default function DeleteConfirmationDialog({
  message,
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!message) return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/80">
        <DialogHeader>
          <DialogTitle>Підтвердіть видалення</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити це повідомлення? Цю дію не можна
            відмінити.
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <div className="my-3 rounded-[1.15rem] border border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/6">
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{message.text}</p>
          </div>
        ) : null}

        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2 [&_button]:m-0 [&_button]:rounded-[.9rem]">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Скасувати
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="animate-spin h-4 w-4" />
                <span className=" animate-pulse">Видалення...</span>
              </>
            ) : (
              "Видалити"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
