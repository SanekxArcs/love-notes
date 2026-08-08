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
        <Button variant="outline" className="h-11 w-full rounded-[1rem] border-white/70 bg-white/45 px-3 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/7">
          <Eye className="h-4 w-4" /> Від партнера ({notes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-lg dark:border-white/15 dark:bg-zinc-950/82">
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
              <div key={note._key} className="rounded-[1.25rem] border border-white/65 bg-white/45 p-3.5 dark:border-white/10 dark:bg-white/6">
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
