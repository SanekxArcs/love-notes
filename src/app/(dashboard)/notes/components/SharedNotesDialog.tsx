"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CornerDownRight,
  Eye,
  Heart,
  LoaderCircle,
  MessageCircleWarning,
  MessagesSquare,
  PencilLine,
  Pencil,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  NewPartnerNote,
  PartnerNote,
  SharedPartnerNote,
} from "../types";
import { ONBOARDING_QUESTIONS } from "../data/onboarding-questions";

const onboardingQuestionById = new Map(
  ONBOARDING_QUESTIONS.map((question) => [question.id, question]),
);

interface SharedNotesDialogProps {
  notes: SharedPartnerNote[];
  ownNotes: PartnerNote[];
  partnerName: string;
  onCreateNote: (data: NewPartnerNote) => Promise<boolean>;
  onAddCorrection: (noteKey: string, text: string) => Promise<boolean>;
  onDeleteCorrection: (
    noteKey: string,
    correctionKey: string,
  ) => Promise<boolean>;
  onAcceptCorrection: (
    noteKey: string,
    correctionKey: string,
    mode: "append" | "replace",
  ) => Promise<boolean>;
  onEditOwnNote: (note: PartnerNote) => void;
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
  onCreateNote,
  onAddCorrection,
  onDeleteCorrection,
  onAcceptCorrection,
  onEditOwnNote,
  isOpen,
  setIsOpen,
}: SharedNotesDialogProps) {
  // The notes-only screen remains below as a dormant fallback. For now the
  // partner entry point always opens the more useful comparison view.
  const [isComparing, setIsComparing] = useState(true);
  const [correctionTarget, setCorrectionTarget] =
    useState<SharedPartnerNote | null>(null);

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
    if (open) {
      setIsComparing(true);
    } else {
      setCorrectionTarget(null);
    }
  };

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
              onCreateNote={onCreateNote}
              onCorrectionRequest={setCorrectionTarget}
              onDeleteCorrection={onDeleteCorrection}
              onAcceptCorrection={onAcceptCorrection}
              onEditOwnNote={onEditOwnNote}
            />
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="grid gap-3 py-2"
            >
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

        <CorrectionDialog
          note={correctionTarget}
          partnerName={partnerName}
          onClose={() => setCorrectionTarget(null)}
          onSubmit={onAddCorrection}
        />
      </DialogContent>
    </Dialog>
  );
}

function ComparisonView({
  partnerNotes,
  ownNotes,
  comparisons,
  partnerName,
  onCreateNote,
  onCorrectionRequest,
  onDeleteCorrection,
  onAcceptCorrection,
  onEditOwnNote,
}: {
  partnerNotes: SharedPartnerNote[];
  ownNotes: PartnerNote[];
  comparisons: Map<string, PartnerNote>;
  partnerName: string;
  onCreateNote: (data: NewPartnerNote) => Promise<boolean>;
  onCorrectionRequest: (note: SharedPartnerNote) => void;
  onDeleteCorrection: (
    noteKey: string,
    correctionKey: string,
  ) => Promise<boolean>;
  onAcceptCorrection: (
    noteKey: string,
    correctionKey: string,
    mode: "append" | "replace",
  ) => Promise<boolean>;
  onEditOwnNote: (note: PartnerNote) => void;
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
            onCorrectionRequest={onCorrectionRequest}
            onDeleteCorrection={onDeleteCorrection}
            onAcceptCorrection={onAcceptCorrection}
            onEditOwnNote={onEditOwnNote}
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
          {unmatchedPartner.length > 0 ? (
            <div className="grid gap-3">
              <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-200">
                Відповісти на нотатки {partnerName} · {unmatchedPartner.length}
              </p>
              {unmatchedPartner.map((note) => (
                <UnansweredNoteComposer
                  key={note._key}
                  note={note}
                  partnerName={partnerName}
                  onCreateNote={onCreateNote}
                  onCorrectionRequest={onCorrectionRequest}
                  onDeleteCorrection={onDeleteCorrection}
                />
              ))}
            </div>
          ) : null}

          {unmatchedOwn.length > 0 ? (
            <UnmatchedColumn
              title="Мої нотатки без пари"
              notes={unmatchedOwn}
              onEditOwnNote={onEditOwnNote}
              onAcceptCorrection={onAcceptCorrection}
            />
          ) : null}
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
  onCorrectionRequest,
  onDeleteCorrection,
  onAcceptCorrection,
  onEditOwnNote,
}: {
  comparison: NoteComparison;
  partnerName: string;
  onCorrectionRequest: (note: SharedPartnerNote) => void;
  onDeleteCorrection: (
    noteKey: string,
    correctionKey: string,
  ) => Promise<boolean>;
  onAcceptCorrection: (
    noteKey: string,
    correctionKey: string,
    mode: "append" | "replace",
  ) => Promise<boolean>;
  onEditOwnNote: (note: PartnerNote) => void;
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
            <button
              type="button"
              onClick={() => onCorrectionRequest(comparison.partnerNote)}
              aria-label={`Уточнити нотатку ${comparison.partnerNote.title}`}
              className="group w-full rounded-[1.35rem] rounded-tl-[.35rem] border border-violet-200/70 bg-violet-100/75 p-4 text-left text-sm leading-6 text-violet-950 shadow-[0_7px_20px_rgba(109,70,170,.1)] transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_10px_24px_rgba(109,70,170,.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 dark:border-violet-400/15 dark:bg-violet-950/38 dark:text-violet-50"
            >
              <p className="whitespace-pre-wrap">
                {comparison.partnerNote.description}
              </p>
              <span className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-violet-600/75 opacity-75 transition group-hover:opacity-100 dark:text-violet-200/70">
                <PencilLine className="h-3 w-3" /> Натисни, щоб уточнити
              </span>
            </button>
            <CorrectionAnnotations
              noteKey={comparison.partnerNote._key}
              corrections={comparison.partnerNote.corrections}
              onDelete={onDeleteCorrection}
            />
          </div>
        </div>

        <div className="flex flex-row-reverse items-start gap-2.5 md:flex-row">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/55 dark:text-pink-200">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <div className="min-w-0 flex-1 text-right md:text-left">
            <div className="mb-1.5 flex items-center justify-end gap-1 md:justify-start">
              <p className="text-[11px] font-semibold text-pink-700 dark:text-pink-200">
                Моя нотатка
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEditOwnNote(comparison.ownNote)}
                aria-label={`Редагувати мою нотатку ${comparison.ownNote.title}`}
                className="h-7 w-7 rounded-full text-pink-700/70 hover:bg-pink-100 hover:text-pink-700 dark:text-pink-200/70 dark:hover:bg-pink-950/35"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="rounded-[1.35rem] rounded-tr-[.35rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] p-4 text-left text-sm leading-6 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.5),0_8px_22px_rgba(207,49,112,.2)] md:rounded-tr-[1.35rem] md:rounded-tl-[.35rem]">
              <p className="whitespace-pre-wrap">{comparison.ownNote.description}</p>
            </div>
            <ReadonlyCorrectionAnnotations
              noteKey={comparison.ownNote._key}
              corrections={comparison.ownNote.corrections}
              onAccept={onAcceptCorrection}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function UnmatchedColumn({
  title,
  notes,
  onEditOwnNote,
  onAcceptCorrection,
}: {
  title: string;
  notes: PartnerNote[];
  onEditOwnNote: (note: PartnerNote) => void;
  onAcceptCorrection: (
    noteKey: string,
    correctionKey: string,
    mode: "append" | "replace",
  ) => Promise<boolean>;
}) {
  return (
    <div className="grid gap-2">
      <p
        className="text-[11px] font-semibold text-pink-700 dark:text-pink-200"
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
            className="rounded-[1.1rem] border border-pink-200/60 bg-pink-50/55 p-3 dark:border-pink-400/15 dark:bg-pink-950/20"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{note.title}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEditOwnNote(note)}
                aria-label={`Редагувати мою нотатку ${note.title}`}
                className="-mr-1 h-7 w-7 shrink-0 rounded-full text-pink-700/70 hover:bg-pink-100 hover:text-pink-700 dark:text-pink-200/70 dark:hover:bg-pink-950/35"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
              {note.description}
            </p>
            <ReadonlyCorrectionAnnotations
              noteKey={note._key}
              corrections={note.corrections}
              onAccept={onAcceptCorrection}
            />
          </div>
        ))
      )}
    </div>
  );
}

function UnansweredNoteComposer({
  note,
  partnerName,
  onCreateNote,
  onCorrectionRequest,
  onDeleteCorrection,
}: {
  note: SharedPartnerNote;
  partnerName: string;
  onCreateNote: (data: NewPartnerNote) => Promise<boolean>;
  onCorrectionRequest: (note: SharedPartnerNote) => void;
  onDeleteCorrection: (
    noteKey: string,
    correctionKey: string,
  ) => Promise<boolean>;
}) {
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const description = answer.trim();
    if (!description || isSaving) return;

    setIsSaving(true);
    try {
      const success = await onCreateNote({
        title: note.title,
        description,
        tags: note.tags ?? [],
        onboardingQuestionId: note.onboardingQuestionId,
        mirroredFromNoteKey: note._key,
      });
      if (success) setAnswer("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <article className="grid gap-3 rounded-[1.35rem] border border-white/60 bg-white/30 p-3 dark:border-white/8 dark:bg-white/3">
      <div className="flex items-center justify-center gap-2">
        <span className="h-px flex-1 bg-violet-200/70 dark:bg-violet-400/15" />
        <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-xs font-semibold dark:border-white/10 dark:bg-white/7">
          {note.title}
        </span>
        <span className="h-px flex-1 bg-pink-200/70 dark:bg-pink-400/15" />
      </div>

      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/55 dark:text-violet-200">
          <UserRound className="h-4 w-4" />
        </span>
        <div className="min-w-0 max-w-[88%]">
          <p className="mb-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-200">
            {partnerName}
          </p>
          <button
            type="button"
            onClick={() => onCorrectionRequest(note)}
            aria-label={`Уточнити нотатку ${note.title}`}
            className="group w-full rounded-[1.35rem] rounded-tl-[.35rem] border border-violet-200/70 bg-violet-100/75 p-3.5 text-left text-sm leading-6 text-violet-950 transition hover:border-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 dark:border-violet-400/15 dark:bg-violet-950/38 dark:text-violet-50"
          >
            <p className="whitespace-pre-wrap">{note.description}</p>
            <span className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-violet-600/75 opacity-75 transition group-hover:opacity-100 dark:text-violet-200/70">
              <PencilLine className="h-3 w-3" /> Натисни, щоб уточнити
            </span>
          </button>
          <CorrectionAnnotations
            noteKey={note._key}
            corrections={note.corrections}
            onDelete={onDeleteCorrection}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="ml-auto flex w-[calc(100%_-_2.75rem)] items-end gap-2"
      >
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-right text-[11px] font-semibold text-pink-700 dark:text-pink-200">
            Моя відповідь
          </p>
          <Textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Напиши свою нотатку…"
            aria-label={`Моя відповідь на тему ${note.title}`}
            className="min-h-16 resize-none rounded-[1.25rem] rounded-tr-[.35rem] border-pink-200/70 bg-pink-50/75 px-4 py-3 text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,.85)] focus-visible:border-pink-400 focus-visible:ring-pink-400/20 dark:border-pink-400/20 dark:bg-pink-950/25"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          aria-label="Зберегти мою нотатку"
          disabled={!answer.trim() || isSaving}
          className="h-11 w-11 shrink-0 rounded-full bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[0_7px_18px_rgba(207,49,112,.24)] hover:brightness-105"
        >
          {isSaving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      <p className="text-right text-[10px] text-muted-foreground">
        Enter — зберегти · Shift + Enter — новий рядок
      </p>
    </article>
  );
}

function CorrectionAnnotations({
  noteKey,
  corrections,
  onDelete,
}: {
  noteKey: string;
  corrections: SharedPartnerNote["corrections"];
  onDelete: (noteKey: string, correctionKey: string) => Promise<boolean>;
}) {
  if (!corrections?.length) return null;

  return (
    <div className="mt-2 grid gap-2 pl-3">
      {corrections.map((correction) => (
        <div
          key={correction._key}
          className="rounded-[1rem] rounded-tl-[.3rem] border border-amber-200/70 bg-amber-50/80 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-amber-300/15 dark:bg-amber-950/25"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-amber-700 dark:text-amber-200">
              <CornerDownRight className="h-3 w-3" /> Уточнення від {correction.authorName}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Видалити уточнення"
                  className="-mt-1 -mr-1 h-7 w-7 shrink-0 rounded-full text-amber-700/65 hover:bg-red-100 hover:text-red-600 dark:text-amber-200/60 dark:hover:bg-red-950/35 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[1.5rem] border-white/65 bg-white/90 backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/92">
                <AlertDialogHeader>
                  <AlertDialogTitle>Видалити уточнення?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Воно зникне для тебе і партнера. Оригінальна нотатка залишиться без змін.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[.9rem]">Скасувати</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void onDelete(noteKey, correction._key)}
                    className="rounded-[.9rem] bg-red-600 text-white hover:bg-red-500"
                  >
                    Видалити
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-amber-950 dark:text-amber-50">
            {correction.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function ReadonlyCorrectionAnnotations({
  noteKey,
  corrections,
  onAccept,
}: {
  noteKey: string;
  corrections: PartnerNote["corrections"];
  onAccept: (
    noteKey: string,
    correctionKey: string,
    mode: "append" | "replace",
  ) => Promise<boolean>;
}) {
  if (!corrections?.length) return null;

  return (
    <div className="mt-2 grid gap-2 text-left">
      {corrections.map((correction) => (
        <div
          key={correction._key}
          className="rounded-[1rem] rounded-tr-[.3rem] border border-amber-200/70 bg-amber-50/85 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-amber-300/15 dark:bg-amber-950/25"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-amber-700 dark:text-amber-200">
              <CornerDownRight className="h-3 w-3" /> Уточнення від {correction.authorName}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Прийняти уточнення та прибрати його"
                  className="-mt-1 -mr-1 h-8 shrink-0 rounded-full border-emerald-200/75 bg-emerald-50/80 px-2.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-950/25 dark:text-emerald-200 dark:hover:bg-emerald-950/45"
                >
                  <Check className="h-3.5 w-3.5" /> Прийняти
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[1.5rem] border-white/65 bg-white/90 backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/92">
                <AlertDialogHeader>
                  <AlertDialogTitle>Прийняти уточнення?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Обери, як застосувати текст уточнення. Після цього уточнення зникне для вас обох.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[.9rem]">Скасувати</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void onAccept(noteKey, correction._key, "append")}
                    className="rounded-[.9rem] bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    <Check className="h-4 w-4" /> Додати до нотатки
                  </AlertDialogAction>
                  <AlertDialogAction
                    onClick={() => void onAccept(noteKey, correction._key, "replace")}
                    className="rounded-[.9rem] bg-pink-600 text-white hover:bg-pink-500"
                  >
                    <Pencil className="h-4 w-4" /> Замінити нотатку
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-amber-950 dark:text-amber-50">
            {correction.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function CorrectionDialog({
  note,
  partnerName,
  onClose,
  onSubmit,
}: {
  note: SharedPartnerNote | null;
  partnerName: string;
  onClose: () => void;
  onSubmit: (noteKey: string, text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const sourceQuestion = note?.onboardingQuestionId
    ? onboardingQuestionById.get(note.onboardingQuestionId)
    : undefined;

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSaving) {
      setText("");
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const correction = text.trim();
    if (!note || !correction || isSaving) return;

    setIsSaving(true);
    try {
      const success = await onSubmit(note._key, correction);
      if (success) {
        setText("");
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(note)} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-[1.65rem] border-white/65 bg-white/88 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_22px_65px_rgba(71,40,62,.2)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/92">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleWarning className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            Уточнити нотатку партнера
          </DialogTitle>
          <DialogDescription>
            Оригінал залишиться без змін. Твоє уточнення з’явиться під ним для вас обох.
          </DialogDescription>
        </DialogHeader>

        {note ? (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="rounded-[1.1rem] border border-white/65 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] dark:border-white/10 dark:bg-white/6">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">
                Початкове питання
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-5">
                {sourceQuestion?.question ?? note.title}
              </p>
              {sourceQuestion ? (
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {sourceQuestion.category}
                </Badge>
              ) : null}
            </div>
            <div className="rounded-[1.2rem] border border-violet-200/70 bg-violet-100/65 p-3 dark:border-violet-400/15 dark:bg-violet-950/30">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-violet-700 dark:text-violet-200">
                Оригінал від {partnerName}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-5">
                {note.description}
              </p>
            </div>
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, 1000))}
              rows={4}
              autoFocus
              placeholder="Наприклад: Насправді я люблю це, але тільки коли…"
              aria-label="Текст уточнення"
              className="min-h-28 resize-none rounded-[1.2rem] border-amber-200/70 bg-amber-50/60 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.85)] focus-visible:border-amber-400 focus-visible:ring-amber-400/20 dark:border-amber-300/15 dark:bg-amber-950/20"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-muted-foreground">{text.length}/1000</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving} className="rounded-[.9rem]">
                  Скасувати
                </Button>
                <Button type="submit" disabled={!text.trim() || isSaving} className="rounded-[.9rem] bg-amber-600 text-white hover:bg-amber-500">
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Додати уточнення
                </Button>
              </div>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
