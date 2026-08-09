"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Hash, LoaderCircle, NotebookPen, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { PageContainer } from "@/components/ui/page-container";

import NoteCard from "./components/NoteCard";
import AddNoteDialog from "./components/AddNoteDialog";
import EditNoteDialog from "./components/EditNoteDialog";
import DeleteNoteDialog from "./components/DeleteNoteDialog";
import AiChatDialog from "./components/AiChatDialog";
import AiTopicDialog from "./components/AiTopicDialog";
import MatchAnalysisDialog from "./components/MatchAnalysisDialog";
import OnboardingWizard from "./components/OnboardingWizard";
import SharedNotesDialog from "./components/SharedNotesDialog";
import NoteSuggestions from "./components/NoteSuggestions";
import { ONBOARDING_QUESTIONS } from "./data/onboarding-questions";
import type {
  EditPartnerNotePayload,
  NewPartnerNote,
  NoteCorrection,
  AiNoteTopic,
  NotePromptSuggestion,
  NoteSuggestion,
  PartnerNote,
  SharedPartnerNote,
} from "./types";

function notesCountLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} нотаток`;
  if (last === 1) return `${count} нотатка`;
  if (last >= 2 && last <= 4) return `${count} нотатки`;
  return `${count} нотаток`;
}

function categoryLabel(value: string) {
  if (value === "__uncategorized") return "Без категорії";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase("uk")
    .replace(/[’ʼ'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const onboardingQuestionById = new Map(
  ONBOARDING_QUESTIONS.map((question) => [question.id, question]),
);

export default function NotesPage() {
  const [notes, setNotes] = useState<PartnerNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSharedOpen, setIsSharedOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PartnerNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<PartnerNote | null>(null);
  const [sharedNotes, setSharedNotes] = useState<SharedPartnerNote[]>([]);
  const [sharedPartnerName, setSharedPartnerName] = useState("Партнер");
  const [noteSuggestions, setNoteSuggestions] = useState<NoteSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<NotePromptSuggestion | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notes");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Не вдалося завантажити нотатки");

      setNotes(data.notes ?? []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Не вдалося завантажити нотатки");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGeminiKeyStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/users/has-gemini-key");
      const data = await response.json();
      setHasGeminiKey(Boolean(data.hasKey));
    } catch (error) {
      console.error("Error checking Gemini key:", error);
    }
  }, []);

  const fetchSharedNotes = useCallback(async () => {
    try {
      const response = await fetch("/api/notes/shared");
      const data = await response.json();
      setSharedNotes(data.notes ?? []);
      setSharedPartnerName(data.partnerName ?? "Партнер");
    } catch (error) {
      console.error("Error fetching partner's shared notes:", error);
    }
  }, []);

  const fetchNoteSuggestions = useCallback(async () => {
    try {
      const response = await fetch("/api/notes/suggestions", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNoteSuggestions(data.suggestions ?? []);
    } catch (error) {
      console.error("Error fetching note suggestions:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchGeminiKeyStatus();
    fetchSharedNotes();
    fetchNoteSuggestions();
  }, [fetchGeminiKeyStatus, fetchNoteSuggestions, fetchNotes, fetchSharedNotes]);

  const handleAddNote = async (data: NewPartnerNote): Promise<boolean> => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(`Помилка: ${result.error || "Не вдалося додати нотатку"}`);
        return false;
      }

      setNotes((prev) => [result.note, ...prev]);
      if (result.note.mirroredFromNoteKey) {
        setNoteSuggestions((prev) =>
          prev.filter((suggestion) => suggestion.key !== result.note.mirroredFromNoteKey),
        );
      }
      toast.success("Нотатку успішно додано!");
      return true;
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Сталася помилка під час додавання нотатки");
      return false;
    }
  };

  const handleAddCorrection = async (
    noteKey: string,
    text: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/notes/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteKey, text }),
      });
      const result: { correction?: NoteCorrection; error?: string } =
        await response.json();

      if (!response.ok || !result.correction) {
        toast.error(result.error || "Не вдалося додати уточнення");
        return false;
      }
      const correction = result.correction;

      setSharedNotes((previous) =>
        previous.map((note) =>
          note._key === noteKey
            ? {
                ...note,
                corrections: [...(note.corrections ?? []), correction],
              }
            : note,
        ),
      );
      toast.success("Уточнення додано — оригінал збережено");
      return true;
    } catch (error) {
      console.error("Error adding note correction:", error);
      toast.error("Не вдалося додати уточнення");
      return false;
    }
  };

  const handleDeleteCorrection = async (
    noteKey: string,
    correctionKey: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/notes/corrections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteKey, correctionKey }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Не вдалося видалити уточнення");
        return false;
      }

      const removeCorrectionFromNote = <T extends PartnerNote | SharedPartnerNote>(
        note: T,
      ) =>
        note._key === noteKey
          ? {
              ...note,
              corrections: note.corrections?.filter(
                (correction) => correction._key !== correctionKey,
              ),
            }
          : note;

      setSharedNotes((previous) => previous.map(removeCorrectionFromNote));
      setNotes((previous) => previous.map(removeCorrectionFromNote));
      toast.success("Уточнення видалено");
      return true;
    } catch (error) {
      console.error("Error deleting note correction:", error);
      toast.error("Не вдалося видалити уточнення");
      return false;
    }
  };

  const handleAcceptCorrection = async (
    noteKey: string,
    correctionKey: string,
    mode: "append" | "replace",
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/notes/corrections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteKey, correctionKey, mode }),
      });
      const result: {
        note?: { _key: string; description: string; updatedAt: string };
        error?: string;
      } = await response.json();

      if (!response.ok || !result.note) {
        toast.error(result.error || "Не вдалося прийняти уточнення");
        return false;
      }
      const acceptedNote = result.note;

      const updateAcceptedNote = <T extends PartnerNote | SharedPartnerNote>(
        note: T,
      ) =>
        note._key === noteKey
          ? {
              ...note,
              description: acceptedNote.description,
              corrections: note.corrections?.filter(
                (correction) => correction._key !== correctionKey,
              ),
            }
          : note;

      setNotes((previous) => previous.map(updateAcceptedNote));
      setSharedNotes((previous) => previous.map(updateAcceptedNote));
      toast.success(
        mode === "append"
          ? "Текст уточнення додано до нотатки"
          : "Текст нотатки замінено уточненням",
      );
      return true;
    } catch (error) {
      console.error("Error accepting note correction:", error);
      toast.error("Не вдалося прийняти уточнення");
      return false;
    }
  };

  const handleDismissSuggestion = async (suggestion: NoteSuggestion) => {
    const previousSuggestions = noteSuggestions;
    setNoteSuggestions((prev) => prev.filter((item) => item.key !== suggestion.key));

    try {
      const response = await fetch("/api/notes/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionKey: suggestion.key }),
      });
      if (!response.ok) throw new Error("Failed to dismiss suggestion");
    } catch (error) {
      console.error("Error dismissing note suggestion:", error);
      setNoteSuggestions(previousSuggestions);
      toast.error("Не вдалося приховати пропозицію");
    }
  };

  const handleAcceptSuggestion = (suggestion: NoteSuggestion) => {
    setActiveSuggestion(suggestion);
    setIsAddOpen(true);
  };

  const handleChooseAiTopic = (topic: AiNoteTopic) => {
    setActiveSuggestion(topic);
    setIsAddOpen(true);
  };

  const handleEditNote = async (
    key: string,
    data: EditPartnerNotePayload,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes?key=${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(`Помилка: ${result.error || "Не вдалося оновити нотатку"}`);
        return false;
      }

      setNotes((prev) =>
        prev.map((note) => (note._key === key ? { ...note, ...result.note } : note)),
      );
      toast.success("Нотатку успішно оновлено!");
      setEditingNote(null);
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Сталася помилка під час оновлення нотатки");
      return false;
    }
  };

  const handleDeleteNote = async (): Promise<boolean> => {
    if (!deletingNote) return false;

    try {
      const response = await fetch(`/api/notes?key=${deletingNote._key}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(`Помилка: ${result.error || "Не вдалося видалити нотатку"}`);
        return false;
      }

      setNotes((prev) => prev.filter((note) => note._key !== deletingNote._key));
      toast.success("Нотатку успішно видалено!");
      setDeletingNote(null);
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Сталася помилка під час видалення нотатки");
      return false;
    }
  };

  const handleToggleShare = async (note: PartnerNote) => {
    const nextShared = !note.isShared;

    setNotes((prev) =>
      prev.map((n) => (n._key === note._key ? { ...n, isShared: nextShared } : n)),
    );

    try {
      const response = await fetch(`/api/notes/share?key=${note._key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isShared: nextShared }),
      });

      if (!response.ok) {
        throw new Error("Failed to update share status");
      }

      toast.success(
        nextShared ? "Нотатку показано партнеру" : "Нотатку приховано від партнера",
      );
    } catch (error) {
      console.error("Error toggling note share status:", error);
      toast.error("Не вдалося оновити статус нотатки");
      setNotes((prev) =>
        prev.map((n) => (n._key === note._key ? { ...n, isShared: note.isShared } : n)),
      );
    }
  };

  const handleBulkShare = async (nextShared: boolean) => {
    const previousNotes = notes;
    setNotes((prev) => prev.map((n) => ({ ...n, isShared: nextShared })));

    try {
      const response = await fetch("/api/notes/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isShared: nextShared }),
      });

      if (!response.ok) {
        throw new Error("Failed to update share status");
      }

      toast.success(
        nextShared
          ? "Усі нотатки показано партнеру"
          : "Усі нотатки приховано від партнера",
      );
    } catch (error) {
      console.error("Error bulk updating note share status:", error);
      toast.error("Не вдалося оновити статус нотаток");
      setNotes(previousNotes);
    }
  };

  const filteredNotes = useMemo(() => {
    const query = normalizeSearchText(search);
    if (!query) return notes;

    return notes.filter((note) => {
      const category = note.tags?.[0]?.trim() || "Без категорії";
      const onboardingQuestion = note.onboardingQuestionId
        ? onboardingQuestionById.get(note.onboardingQuestionId)
        : undefined;
      const haystack = normalizeSearchText(
        [
          note.title,
          category,
          categoryLabel(category.toLocaleLowerCase("uk")),
          note.description,
          ...(note.tags ?? []),
          onboardingQuestion?.category,
          onboardingQuestion?.question,
        ]
          .filter(Boolean)
          .join(" "),
      );
      return haystack.includes(query);
    });
  }, [notes, search]);

  const groupedNotes = useMemo(() => {
    const groups = new Map<string, PartnerNote[]>();

    for (const note of filteredNotes) {
      const category = note.tags?.[0]?.trim().toLocaleLowerCase("uk") || "__uncategorized";
      const group = groups.get(category) ?? [];
      group.push(note);
      groups.set(category, group);
    }

    return [...groups.entries()]
      .sort(([left], [right]) => {
        if (left === "__uncategorized") return 1;
        if (right === "__uncategorized") return -1;
        return left.localeCompare(right, "uk");
      })
      .map(([category, categoryNotes]) => ({
        category,
        notes: categoryNotes,
      }));
  }, [filteredNotes]);

  const availableTags = useMemo(() => {
    const uniqueTags = new Map<string, string>();
    for (const note of notes) {
      for (const tag of note.tags ?? []) {
        const trimmedTag = tag.trim();
        if (!trimmedTag) continue;
        const key = trimmedTag.toLocaleLowerCase("uk");
        if (!uniqueTags.has(key)) uniqueTags.set(key, trimmedTag);
      }
    }
    return [...uniqueTags.values()].sort((left, right) =>
      left.localeCompare(right, "uk"),
    );
  }, [notes]);

  const allShared = notes.length > 0 && notes.every((note) => note.isShared);

  const answeredQuestionIds = useMemo(
    () => new Set(notes.map((note) => note.onboardingQuestionId).filter(Boolean)),
    [notes],
  );
  const unansweredQuestionsCount = ONBOARDING_QUESTIONS.filter(
    (q) => !answeredQuestionIds.has(q.id),
  ).length;

  return (
    <PageContainer size="default">
      <BackButton text="Нотатки про партнера" />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="mb-4 rounded-[1.75rem] border border-white/60 bg-white/52 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.1)] backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/48"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_8px_20px_rgba(207,49,112,.24)]">
            <NotebookPen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight">Важливе про партнера</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Деталі, вподобання та спільні відкриття</p>
          </div>
          <div className="shrink-0 rounded-full border border-white/65 bg-white/50 px-3 py-1.5 text-[11px] font-bold text-pink-700 dark:border-white/10 dark:bg-white/7 dark:text-pink-200">
            {notesCountLabel(notes.length)}
          </div>
        </div>

        <div className="mt-4 grid gap-2.5">
          <div className="rounded-[1.3rem] border border-white/60 bg-white/35 p-2.5 dark:border-white/10 dark:bg-white/4">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
              Мої нотатки
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <AddNoteDialog
                isOpen={isAddOpen}
                setIsOpen={(open) => {
                  setIsAddOpen(open);
                  if (!open) setActiveSuggestion(null);
                }}
                onSubmit={handleAddNote}
                availableTags={availableTags}
                suggestion={activeSuggestion}
              />
              {unansweredQuestionsCount > 0 && (
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-[1rem] border-white/70 bg-white/45 px-3 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/7"
                  onClick={() => setIsOnboardingOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  {notes.length === 0
                    ? "Заповнити початкові дані"
                    : `Продовжити анкету (${unansweredQuestionsCount})`}
                </Button>
              )}
            </div>
          </div>

          {(sharedNotes.length > 0 || notes.length > 0) && (
            <div className="rounded-[1.3rem] border border-white/60 bg-white/35 p-2.5 dark:border-white/10 dark:bg-white/4">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
                Для двох
              </p>
              <div className="grid grid-cols-2 gap-2 [&>*:only-child]:col-span-2">
                {sharedNotes.length > 0 && (
                  <SharedNotesDialog
                    notes={sharedNotes}
                    ownNotes={notes}
                    partnerName={sharedPartnerName}
                    onCreateNote={handleAddNote}
                    onAddCorrection={handleAddCorrection}
                    onDeleteCorrection={handleDeleteCorrection}
                    onAcceptCorrection={handleAcceptCorrection}
                    onEditOwnNote={setEditingNote}
                    isOpen={isSharedOpen}
                    setIsOpen={setIsSharedOpen}
                  />
                )}
                {notes.length > 0 && (
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-[1rem] border-white/70 bg-white/45 px-3 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/7"
                    onClick={() => handleBulkShare(!allShared)}
                  >
                    {allShared ? (
                      <><EyeOff className="h-4 w-4" /> Приховати всі</>
                    ) : (
                      <><Eye className="h-4 w-4" /> Показати всі</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {Boolean(hasGeminiKey) && (
            <div className="rounded-[1.3rem] border border-pink-200/55 bg-pink-50/30 p-2.5 dark:border-pink-400/15 dark:bg-pink-950/12">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.14em] text-pink-700/70 dark:text-pink-200/70">
                AI інструменти
              </p>
              <div className="grid grid-cols-2 gap-2 [&>*:only-child]:col-span-2">
                <AiChatDialog isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
                <AiTopicDialog
                  isOpen={isTopicOpen}
                  setIsOpen={setIsTopicOpen}
                  onChoose={handleChooseAiTopic}
                />
                {notes.length > 0 && sharedNotes.length > 0 && (
                  <MatchAnalysisDialog isOpen={isMatchOpen} setIsOpen={setIsMatchOpen} />
                )}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      <NoteSuggestions
        suggestions={noteSuggestions}
        onAccept={handleAcceptSuggestion}
        onDismiss={handleDismissSuggestion}
      />

      <div className="relative mb-4 rounded-[1.25rem] border border-white/60 bg-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,.85),0_8px_24px_rgba(71,40,62,.08)] backdrop-blur-xl dark:border-white/12 dark:bg-zinc-950/45">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-700 dark:text-pink-200" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за назвою, категорією або текстом..."
          className="h-12 rounded-[1.25rem] border-0 bg-transparent pr-4 pl-11 shadow-none focus-visible:ring-pink-400/30"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-[1.5rem] border border-white/60 bg-white/45 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <LoaderCircle className="h-7 w-7 animate-spin text-pink-600" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-dashed border-pink-200/80 bg-white/42 px-6 py-10 text-center backdrop-blur-xl dark:border-pink-400/20 dark:bg-white/4">
            <p className="text-2xl">📝</p>
            <p className="font-medium">Тут поки що порожньо</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Давай швидко заповнимо перші нотатки про партнера — просто дай
              відповідь на кілька питань.
            </p>
            <Button onClick={() => setIsOnboardingOpen(true)} className="h-11 rounded-[1rem] bg-pink-600 px-4 text-white hover:bg-pink-500">
              <Sparkles className="h-4 w-4" /> Заповнити початкові дані
            </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/60 bg-white/35 py-10 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/4">Нічого не знайдено.</div>
      ) : (
        <div className="grid gap-4">
          {groupedNotes.map((group) => (
            <section key={group.category} className="grid gap-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-[.75rem] border border-pink-200/65 bg-pink-50/65 text-pink-700 dark:border-pink-400/20 dark:bg-pink-950/30 dark:text-pink-200">
                  <Hash className="h-3.5 w-3.5" />
                </span>
                <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {categoryLabel(group.category)}
                </h2>
                <span className="rounded-full bg-white/45 px-2.5 py-1 text-[10px] font-bold text-muted-foreground dark:bg-white/6">
                  {group.notes.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.notes.map((note) => (
                  <NoteCard
                    key={note._key}
                    note={note}
                    onEdit={setEditingNote}
                    onDelete={setDeletingNote}
                    onToggleShare={handleToggleShare}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <EditNoteDialog
        note={editingNote}
        isOpen={Boolean(editingNote)}
        setIsOpen={(open) => {
          if (!open) setEditingNote(null);
        }}
        onSubmit={handleEditNote}
        availableTags={availableTags}
      />

      <DeleteNoteDialog
        note={deletingNote}
        isOpen={Boolean(deletingNote)}
        setIsOpen={(open) => {
          if (!open) setDeletingNote(null);
        }}
        onConfirm={handleDeleteNote}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        setIsOpen={setIsOnboardingOpen}
        existingNotes={notes}
        onNoteCreated={(note) => {
          setNotes((prev) => [note, ...prev]);
          if (note.onboardingQuestionId) {
            setNoteSuggestions((prev) =>
              prev.filter(
                (suggestion) =>
                  suggestion.onboardingQuestionId !== note.onboardingQuestionId,
              ),
            );
          }
        }}
      />
    </PageContainer>
  );
}
