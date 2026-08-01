"use client";

import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SharedPartnerNote } from "../types";

interface SharedNotesDialogProps {
  notes: SharedPartnerNote[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SharedNotesDialog({
  notes,
  isOpen,
  setIsOpen,
}: SharedNotesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" /> Нотатки від партнера ({notes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto custom-scrollbar sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Нотатки, якими поділився партнер</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Партнер поки що не показав жодної нотатки.
            </p>
          ) : (
            notes.map((note) => (
              <div key={note._key} className="rounded-md border p-3">
                <p className="text-sm font-medium">{note.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {note.description}
                </p>
                {Boolean(note.tags?.length) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {note.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
