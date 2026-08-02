"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import MessageHistory from "./MessageHistory";
import type { Message } from "../messages/types";
import { LoaderCircle, Search } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMessages = async () => {
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
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((message) => {
      const haystack = [message.text, message.userName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [messages, search]);

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <BackButton text="Історія повідомлень" />
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoaderCircle className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за текстом чи іменем..."
              className="pl-9"
            />
          </div>
          <MessageHistory messages={filteredMessages} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
