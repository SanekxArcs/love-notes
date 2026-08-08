"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import MessageHistory from "./MessageHistory";
import type { Message } from "../messages/types";
import { Archive, Heart, LoaderCircle, Search } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/settings/messages");
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Помилка завантаження повідомлень");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    [],
  );

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((message) => message.text.toLowerCase().includes(query));
  }, [messages, search]);

  const shownMessages = messages.filter((message) => message.isShown);
  const likedMessages = shownMessages.filter((message) => message.like).length;

  return (
    <PageContainer>
      <BackButton text="Історія повідомлень" />
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="mb-4 rounded-[1.75rem] border border-white/60 bg-white/52 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.1)] backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/48"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_8px_20px_rgba(207,49,112,.24)]">
            <Archive className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight">Архів теплих слів</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Усі листи, які вже знайшли свій момент
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[1.1rem] border border-white/60 bg-white/45 p-3 dark:border-white/10 dark:bg-white/6">
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{shownMessages.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">відкрито</p>
          </div>
          <div className="rounded-[1.1rem] border border-white/60 bg-white/45 p-3 dark:border-white/10 dark:bg-white/6">
            <p className="flex items-center gap-1 text-xl font-bold text-pink-700 dark:text-pink-200">
              {likedMessages} <Heart className="h-4 w-4 fill-current" />
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">сподобалось</p>
          </div>
        </div>
      </motion.section>
      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-[1.5rem] border border-white/60 bg-white/45 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <LoaderCircle className="h-7 w-7 animate-spin text-pink-600" />
        </div>
      ) : (
        <>
          <div className="relative mb-4 rounded-[1.25rem] border border-white/60 bg-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,.85),0_8px_24px_rgba(71,40,62,.08)] backdrop-blur-xl dark:border-white/12 dark:bg-zinc-950/45">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-700 dark:text-pink-200" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Пошук за текстом повідомлення..."
              className="h-12 rounded-[1.25rem] border-0 bg-transparent pr-12 pl-11 shadow-none focus-visible:ring-pink-400/30"
            />
            {search ? (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                {filteredMessages.filter((message) => message.isShown).length}
              </span>
            ) : null}
          </div>
          <MessageHistory messages={filteredMessages} isLoading={isLoading} />
        </>
      )}
    </PageContainer>
  );
}
