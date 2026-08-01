"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";

import NoteCard from "./components/NoteCard";
import AddNoteDialog from "./components/AddNoteDialog";
import EditNoteDialog from "./components/EditNoteDialog";
import DeleteNoteDialog from "./components/DeleteNoteDialog";
import AiChatDialog from "./components/AiChatDialog";
import OnboardingWizard from "./components/OnboardingWizard";
import type { EditPartnerNotePayload, NewPartnerNote, PartnerNote } from "./types";

export default function NotesPage() {
  const [notes, setNotes] = useState<PartnerNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PartnerNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<PartnerNote | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchGeminiKeyStatus();
  }, []);

  async function fetchNotes() {
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
  }

  async function fetchGeminiKeyStatus() {
    try {
      const response = await fetch("/api/users/has-gemini-key");
      const data = await response.json();
      setHasGeminiKey(Boolean(data.hasKey));
    } catch (error) {
      console.error("Error checking Gemini key:", error);
    }
  }

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
      toast.success("Нотатку успішно додано!");
      return true;
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Сталася помилка під час додавання нотатки");
      return false;
    }
  };

  const handleEditNote = async (
    key: string,
    data: EditPartnerNotePayload
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
        prev.map((note) => (note._key === key ? { ...note, ...result.note } : note))
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

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((note) => {
      const haystack = [note.title, note.description, ...(note.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [notes, search]);

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <BackButton text="Нотатки про партнера" />
        <div className="flex flex-wrap gap-2">
          {hasGeminiKey && <AiChatDialog isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
          <AddNoteDialog isOpen={isAddOpen} setIsOpen={setIsAddOpen} onSubmit={handleAddNote} />
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за заголовком, описом чи тегом..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Завантаження...</p>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-2xl">📝</p>
            <p className="font-medium">Тут поки що порожньо</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Давай швидко заповнимо перші нотатки про партнера — просто дай
              відповідь на кілька питань.
            </p>
            <Button onClick={() => setIsOnboardingOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" /> Заповнити початкові дані
            </Button>
          </CardContent>
        </Card>
      ) : filteredNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нічого не знайдено.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._key}
              note={note}
              onEdit={setEditingNote}
              onDelete={setDeletingNote}
            />
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
        onNoteCreated={(note) => setNotes((prev) => [note, ...prev])}
      />
    </div>
  );
}
