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
import { Message } from "../types";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Підтвердіть видалення</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити це повідомлення? Цю дію не можна
            відмінити.
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="my-4 p-3 ring ring-secondary rounded-md">
            <p className="font-mono text-sm">{message.text}</p>
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
