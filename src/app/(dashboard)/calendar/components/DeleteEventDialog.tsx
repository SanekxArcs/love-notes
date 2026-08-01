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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Підтвердіть видалення</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити цю подію? Цю дію не можна
            відмінити.
          </DialogDescription>
        </DialogHeader>

        {event && (
          <div className="my-4 p-3 ring ring-secondary rounded-md">
            <p className="font-mono text-sm">
              {event.title || event.date}
            </p>
          </div>
        )}

        <DialogFooter>
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
