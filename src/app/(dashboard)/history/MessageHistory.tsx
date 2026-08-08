"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowDown, ArrowUp, CalendarDays, Heart, Inbox, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Message } from "../messages/types";

interface MessageHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

type SortDirection = "asc" | "desc";
type SortField = "date" | "category";

interface HistoryCardProps {
  message: Message;
  onSelect: (message: Message) => void;
}

function categoryLabel(category: Message["category"]) {
  if (category === "daily") return "Щоденне";
  if (category === "extra") return "Додаткове";
  return "Без категорії";
}

function HistoryCard({ message, onSelect }: HistoryCardProps) {
  const handleSelect = useCallback(() => onSelect(message), [message, onSelect]);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      onClick={handleSelect}
      className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/52 p-4 text-left shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_28px_rgba(71,40,62,.09)] backdrop-blur-2xl transition-transform active:scale-[.985] dark:border-white/12 dark:bg-zinc-950/48"
    >
      <div className="pointer-events-none absolute -right-12 -top-14 h-28 w-28 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-700/12" />
      <div className="relative flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[.9rem] border border-white/65 bg-white/55 text-pink-700 dark:border-white/12 dark:bg-white/8 dark:text-pink-200">
          <Inbox className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-[15px] font-medium leading-6 text-zinc-800 dark:text-zinc-100">
            {message.text || "Повідомлення без тексту"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserRound className="h-3.5 w-3.5" /> {message.userName || "Не вказано"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {message.shownAt
                ? format(new Date(message.shownAt), "d MMM, HH:mm", { locale: uk })
                : "Без дати"}
            </span>
          </div>
        </div>
        <Heart
          className={`h-5 w-5 shrink-0 ${
            message.like
              ? "fill-pink-500 text-pink-500"
              : "text-zinc-300 dark:text-zinc-600"
          }`}
        />
      </div>
      <span className="relative mt-3 inline-flex rounded-full border border-white/60 bg-white/50 px-2 py-1 text-[10px] font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300">
        {categoryLabel(message.category)}
      </span>
    </motion.button>
  );
}

export default function MessageHistory({ messages, isLoading }: MessageHistoryProps) {
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "date",
    direction: "desc",
  });
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedMessages = useMemo(() => {
    const shownMessages = messages.filter((message) => message.isShown);
    return [...shownMessages].sort((a, b) => {
      let comparison = 0;
      if (sort.field === "date") {
        comparison =
          (a.shownAt ? new Date(a.shownAt).getTime() : 0) -
          (b.shownAt ? new Date(b.shownAt).getTime() : 0);
      } else {
        comparison = (a.category || "").localeCompare(b.category || "", "uk");
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [messages, sort]);

  const handleSortField = useCallback((field: SortField) => {
    setSort((current) => ({ ...current, field }));
  }, []);

  const toggleDirection = useCallback(() => {
    setSort((current) => ({
      ...current,
      direction: current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSelect = useCallback((message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  }, []);

  if (isLoading) return null;

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Select value={sort.field} onValueChange={handleSortField}>
          <SelectTrigger aria-label="Сортувати історію" className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">За датою</SelectItem>
            <SelectItem value="category">За категорією</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleDirection}
          aria-label={sort.direction === "asc" ? "За зростанням" : "За спаданням"}
          className="h-11 w-11 shrink-0 rounded-[1rem] border border-white/70 bg-white/45 text-pink-700 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/8 dark:text-pink-200"
        >
          {sort.direction === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {sortedMessages.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/70 bg-white/35 px-5 py-10 text-center backdrop-blur-xl dark:border-white/12 dark:bg-white/4">
          <ArchiveEmptyState />
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {sortedMessages.map((message) => (
              <HistoryCard key={message._key} message={message} onSelect={handleSelect} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/80">
          <DialogHeader>
            <DialogTitle>Деталі повідомлення</DialogTitle>
          </DialogHeader>
          {selectedMessage ? (
            <div className="space-y-3 py-1">
              <div className="rounded-[1.2rem] border border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/6">
                <p className="text-[15px] font-medium leading-6">{selectedMessage.text || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Detail label="Від кого" value={selectedMessage.userName || "Не вказано"} />
                <Detail label="Категорія" value={categoryLabel(selectedMessage.category)} />
                <Detail
                  label="Дата показу"
                  value={
                    selectedMessage.shownAt
                      ? format(new Date(selectedMessage.shownAt), "d MMMM yyyy, HH:mm", {
                          locale: uk,
                        })
                      : "Не показано"
                  }
                />
                <Detail
                  label="Реакція"
                  value={selectedMessage.like ? "❤️ Сподобалось" : "🤍 Без реакції"}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/55 bg-white/35 p-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-5">{value}</p>
    </div>
  );
}

function ArchiveEmptyState() {
  return (
    <>
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-pink-100/70 text-pink-600 dark:bg-pink-950/30 dark:text-pink-300">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold">Архів поки порожній</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        Тут з’являться повідомлення після того, як партнер їх відкриє.
      </p>
    </>
  );
}
