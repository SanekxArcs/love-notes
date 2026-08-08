"use client";

import { CornerDownRight, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
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
    <Card className="gap-0 rounded-[1.5rem] border-white/60 bg-white/50 py-0 shadow-[inset_0_1px_1px_rgba(255,255,255,.88),0_9px_26px_rgba(71,40,62,.08)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-950/45">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
        <CardTitle className="pt-1 text-[15px] leading-5">{note.title}</CardTitle>
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
              className="h-8 w-8 rounded-[.8rem] bg-white/40 dark:bg-white/5"
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
            className="h-8 w-8 rounded-[.8rem] bg-white/40 dark:bg-white/5"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note)}
            aria-label="Видалити нотатку"
            className="h-8 w-8 rounded-[.8rem] text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pt-1 pb-4">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {note.description}
        </p>
        {Boolean(note.corrections?.length) && (
          <div className="grid gap-2 rounded-[1.1rem] border border-amber-200/65 bg-amber-50/65 p-3 dark:border-amber-300/15 dark:bg-amber-950/20">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-amber-700 dark:text-amber-200">
              <CornerDownRight className="h-3.5 w-3.5" /> Уточнення від партнера
            </p>
            {note.corrections?.map((correction) => (
              <div key={correction._key} className="border-l-2 border-amber-300/70 pl-2.5 dark:border-amber-300/25">
                <p className="whitespace-pre-wrap text-xs leading-5 text-amber-950 dark:text-amber-50">
                  {correction.text}
                </p>
                <p className="mt-1 text-[10px] text-amber-700/70 dark:text-amber-200/60">
                  {correction.authorName}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {Boolean(note.isShared) && <Badge className="border-0 bg-pink-100 text-pink-700 dark:bg-pink-950/45 dark:text-pink-200">Показано партнеру</Badge>}
          {note.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="border border-white/60 bg-white/50 dark:border-white/10 dark:bg-white/7">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
