"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "../types";

interface DeleteEventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => Promise<boolean>;
}

export default function DeleteEventDialog({
  event,
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-sm dark:border-white/15 dark:bg-zinc-950/82">
        <DialogHeader>
          <DialogTitle>Підтвердіть видалення</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити цю подію? Цю дію не можна
            відмінити.
          </DialogDescription>
        </DialogHeader>

        {event ? (
          <div className="my-4 rounded-[1.15rem] border border-red-200/70 bg-red-50/45 p-3 dark:border-red-900/30 dark:bg-red-950/20">
            <p className="text-sm font-medium">
              {event.title || event.date}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="h-11 rounded-[1rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6"
          >
            Скасувати
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-11 rounded-[1rem]"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="animate-spin h-4 w-4" />
                <span className="animate-pulse">Видалення...</span>
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
