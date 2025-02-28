"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteConfirmationDialog({ isOpen, setIsOpen, message, onConfirm }) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Підтвердження видалення</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Ви впевнені, що хочете видалити це повідомлення?</p>
          <p className="mt-2 text-sm text-gray-500">Цю дію неможливо скасувати.</p>
          {message && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">Текст повідомлення:</p>
              <p className="text-sm italic">{message.text}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Скасувати
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                Видалення...
              </>
            ) : (
              "Видалити"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
