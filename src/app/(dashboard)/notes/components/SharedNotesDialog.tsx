"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, Heart, MessagesSquare, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PartnerNote, SharedPartnerNote } from "../types";

interface SharedNotesDialogProps {
  notes: SharedPartnerNote[];
  ownNotes: PartnerNote[];
  partnerName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NoteComparison {
  partnerNote: SharedPartnerNote;
  ownNote: PartnerNote;
}

function normalized(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("uk") ?? "";
}

function findMatchingOwnNote(
  partnerNote: SharedPartnerNote,
  ownNotes: PartnerNote[],
) {
  return ownNotes.find(
    (ownNote) =>
      (partnerNote.onboardingQuestionId &&
        ownNote.onboardingQuestionId === partnerNote.onboardingQuestionId) ||
      ownNote.mirroredFromNoteKey === partnerNote._key ||
      normalized(ownNote.title) === normalized(partnerNote.title),
  );
}

export default function SharedNotesDialog({
  notes,
  ownNotes,
  partnerName,
  isOpen,
  setIsOpen,
}: SharedNotesDialogProps) {
  const [isComparing, setIsComparing] = useState(false);

  const comparisons = useMemo(() => {
    const result = new Map<string, PartnerNote>();
    for (const partnerNote of notes) {
      const ownNote = findMatchingOwnNote(partnerNote, ownNotes);
      if (ownNote) result.set(partnerNote._key, ownNote);
    }
    return result;
  }, [notes, ownNotes]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setIsComparing(false);
  };
  const showComparison = useCallback(() => setIsComparing(true), []);
  const hideComparison = useCallback(() => setIsComparing(false), []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full rounded-[1rem] border-white/70 bg-white/45 px-3 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/7"
        >
          <Eye className="h-4 w-4" /> Від партнера ({notes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/82 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-3xl dark:border-white/15 dark:bg-zinc-950/86">
        <DialogHeader className="text-left">
          {isComparing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={hideComparison}
              className="mb-1 h-9 w-fit rounded-[.85rem] px-2 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> До нотаток
            </Button>
          ) : null}
          <DialogTitle>
            {isComparing ? "Порівняння відповідей" : "Нотатки від партнера"}
          </DialogTitle>
          <DialogDescription>
            {isComparing
              ? "Спочатку спільні теми, нижче — нотатки, для яких ще немає пари."
              : `Теми та деталі, якими ${partnerName} ділиться з тобою.`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait" initial={false}>
          {isComparing ? (
            <ComparisonView
              key="comparison"
              partnerNotes={notes}
              ownNotes={ownNotes}
              comparisons={comparisons}
              partnerName={partnerName}
            />
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="grid gap-3 py-2"
            >
              {comparisons.size > 0 ? (
                <Button
                  type="button"
                  onClick={showComparison}
                  className="h-11 w-full rounded-[1rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.55),0_8px_22px_rgba(207,49,112,.22)] hover:brightness-105"
                >
                  <MessagesSquare className="h-4 w-4" /> Порівняти всі відповіді
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                    {comparisons.size}
                  </span>
                </Button>
              ) : null}

              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Партнер поки що не показав жодної нотатки.
                </p>
              ) : (
                notes.map((note) => (
                  <article
                    key={note._key}
                    className="rounded-[1.25rem] border border-white/65 bg-white/48 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] dark:border-white/10 dark:bg-white/6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{note.title}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {note.description}
                        </p>
                      </div>
                      {comparisons.has(note._key) ? (
                        <Badge className="shrink-0 border-pink-200/60 bg-pink-100/70 text-[10px] text-pink-700 dark:border-pink-400/15 dark:bg-pink-950/35 dark:text-pink-200">
                          Є відповідь
                        </Badge>
                      ) : null}
                    </div>
                    {Boolean(note.tags?.length) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {note.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </article>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function ComparisonView({
  partnerNotes,
  ownNotes,
  comparisons,
  partnerName,
}: {
  partnerNotes: SharedPartnerNote[];
  ownNotes: PartnerNote[];
  comparisons: Map<string, PartnerNote>;
  partnerName: string;
}) {
  const pairs: NoteComparison[] = partnerNotes.flatMap((partnerNote) => {
    const ownNote = comparisons.get(partnerNote._key);
    return ownNote ? [{ partnerNote, ownNote }] : [];
  });
  const matchedOwnKeys = new Set(pairs.map((pair) => pair.ownNote._key));
  const unmatchedPartner = partnerNotes.filter(
    (note) => !comparisons.has(note._key),
  );
  const unmatchedOwn = ownNotes.filter((note) => !matchedOwnKeys.has(note._key));

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="grid gap-6 py-2"
    >
      <section className="grid gap-5">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4 text-pink-600 dark:text-pink-300" />
          <h3 className="text-sm font-semibold">Спільні теми</h3>
          <span className="rounded-full bg-pink-100/75 px-2 py-0.5 text-[10px] font-bold text-pink-700 dark:bg-pink-950/40 dark:text-pink-200">
            {pairs.length}
          </span>
        </div>
        {pairs.map((comparison) => (
          <ComparisonPair
            key={comparison.partnerNote._key}
            comparison={comparison}
            partnerName={partnerName}
          />
        ))}
      </section>

      {unmatchedPartner.length > 0 || unmatchedOwn.length > 0 ? (
        <section className="grid gap-3 border-t border-white/60 pt-5 dark:border-white/10">
          <div>
            <h3 className="text-sm font-semibold">Без схожої відповіді</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Ці нотатки поки що не мають відповідної теми з іншого боку.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <UnmatchedColumn
              title={partnerName}
              notes={unmatchedPartner}
              variant="partner"
            />
            <UnmatchedColumn title="Мої нотатки" notes={unmatchedOwn} variant="own" />
          </div>
        </section>
      ) : null}

      <p className="text-center text-[11px] leading-4 text-muted-foreground">
        Порівнюйте з цікавістю, а не як правильну й неправильну відповідь.
      </p>
    </motion.div>
  );
}

function ComparisonPair({
  comparison,
  partnerName,
}: {
  comparison: NoteComparison;
  partnerName: string;
}) {
  return (
    <article className="grid gap-3 rounded-[1.4rem] border border-white/60 bg-white/30 p-3 dark:border-white/8 dark:bg-white/3">
      <div className="flex items-center justify-center gap-2">
        <span className="h-px flex-1 bg-violet-200/70 dark:bg-violet-400/15" />
        <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/7 dark:text-zinc-200">
          {comparison.partnerNote.title}
        </span>
        <span className="h-px flex-1 bg-pink-200/70 dark:bg-pink-400/15" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/55 dark:text-violet-200">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-200">
              {partnerName}
            </p>
            <div className="rounded-[1.35rem] rounded-tl-[.35rem] border border-violet-200/70 bg-violet-100/75 p-4 text-sm leading-6 text-violet-950 shadow-[0_7px_20px_rgba(109,70,170,.1)] dark:border-violet-400/15 dark:bg-violet-950/38 dark:text-violet-50">
              <p className="whitespace-pre-wrap">
                {comparison.partnerNote.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row-reverse items-start gap-2.5 md:flex-row">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/55 dark:text-pink-200">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <div className="min-w-0 flex-1 text-right md:text-left">
            <p className="mb-1.5 text-[11px] font-semibold text-pink-700 dark:text-pink-200">
              Моя нотатка
            </p>
            <div className="rounded-[1.35rem] rounded-tr-[.35rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] p-4 text-left text-sm leading-6 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.5),0_8px_22px_rgba(207,49,112,.2)] md:rounded-tr-[1.35rem] md:rounded-tl-[.35rem]">
              <p className="whitespace-pre-wrap">{comparison.ownNote.description}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function UnmatchedColumn({
  title,
  notes,
  variant,
}: {
  title: string;
  notes: Array<PartnerNote | SharedPartnerNote>;
  variant: "partner" | "own";
}) {
  return (
    <div className="grid gap-2">
      <p
        className={`text-[11px] font-semibold ${variant === "partner" ? "text-violet-700 dark:text-violet-200" : "text-pink-700 dark:text-pink-200"}`}
      >
        {title} · {notes.length}
      </p>
      {notes.length === 0 ? (
        <div className="rounded-[1rem] border border-dashed border-white/60 p-3 text-xs text-muted-foreground dark:border-white/10">
          Усі нотатки мають пару
        </div>
      ) : (
        notes.map((note) => (
          <div
            key={note._key}
            className={`rounded-[1.1rem] border p-3 ${variant === "partner" ? "border-violet-200/60 bg-violet-50/55 dark:border-violet-400/15 dark:bg-violet-950/20" : "border-pink-200/60 bg-pink-50/55 dark:border-pink-400/15 dark:bg-pink-950/20"}`}
          >
            <p className="text-xs font-semibold">{note.title}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
              {note.description}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
