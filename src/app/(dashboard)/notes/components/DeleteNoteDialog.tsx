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
import type { PartnerNote } from "../types";

interface DeleteNoteDialogProps {
  note: PartnerNote | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => Promise<boolean>;
}

export default function DeleteNoteDialog({
  note,
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteNoteDialogProps) {
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
            Ви впевнені, що хочете видалити цю нотатку? Цю дію не можна
            відмінити.
          </DialogDescription>
        </DialogHeader>

        {note && (
          <div className="my-4 p-3 ring ring-secondary rounded-md">
            <p className="font-medium text-sm">{note.title}</p>
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
