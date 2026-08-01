"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import type { PartnerNote } from "../types";

interface NoteCardProps {
  note: PartnerNote;
  onEdit: (note: PartnerNote) => void;
  onDelete: (note: PartnerNote) => void;
  onToggleShare: (note: PartnerNote) => void;
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleShare,
}: NoteCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{note.title}</CardTitle>
        <div className="flex gap-1">
          <CustomTooltip
            text={note.isShared ? "Приховати від партнера" : "Показати партнеру"}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleShare(note)}
              aria-label={
                note.isShared ? "Приховати від партнера" : "Показати партнеру"
              }
            >
              {note.isShared ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </CustomTooltip>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(note)}
            aria-label="Редагувати нотатку"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note)}
            aria-label="Видалити нотатку"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {note.description}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {Boolean(note.isShared) && <Badge>Показано партнеру</Badge>}
          {note.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
