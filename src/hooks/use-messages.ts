import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { triggerConfetti } from "@/lib/confetti";
import type { Message } from "@/sanity/types";

export type MessageWithKey = Message & { _key: string };

interface DashboardSettings {
  dailyMessageLimit: number;
  contactNumber: string;
  partnerIdToReceiveFrom: string;
  partnerIdToSend: string;
  userName: string;
}

const defaultSettings: DashboardSettings = {
  dailyMessageLimit: 0,
  contactNumber: "",
  partnerIdToReceiveFrom: "",
  partnerIdToSend: "",
  userName: "",
};

function normalizeMessages(messages: MessageWithKey[] | undefined) {
  return (messages ?? []).map((message) => ({
    ...message,
    shownAt: message.shownAt
      ? new Date(message.shownAt).toISOString()
      : new Date().toISOString(),
  }));
}

export function useMessages() {
  const [settings, setSettings] = useState(defaultSettings);
  const [todayMessages, setTodayMessages] = useState<MessageWithKey[]>([]);
  const [previousMessages, setPreviousMessages] = useState<MessageWithKey[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [noMessagesAvailable, setNoMessagesAvailable] = useState(false);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages/history");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      const currentMessages = normalizeMessages(data.todayMessages);
      setSettings(data.settings ?? defaultSettings);
      setTodayMessages(currentMessages);
      setPreviousMessages(normalizeMessages(data.previousMessages));
      setMessageCount(currentMessages.length);
      setNoMessagesAvailable(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const getNewMessage = useCallback(async () => {
    if (messageCount >= settings.dailyMessageLimit) {
      toast.info("Досягнуто денний ліміт повідомлень");
      return;
    }
    if (!settings.partnerIdToReceiveFrom) {
      toast.error("ID партнера не встановлено. Відвідайте сторінку допомоги.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/messages/random");
      if (response.status === 429 || response.status === 409) {
        const errorData = await response.json();
        await fetchMessages();
        toast.info(
          response.status === 429
            ? "Досягнуто денний ліміт повідомлень"
            : errorData.error || "Стан повідомлень змінився. Спробуйте ще раз.",
        );
        return;
      }
      if (response.status === 404) {
        const errorData = await response.json();
        if (errorData.error?.includes("No unshown messages")) {
          toast.error("😢 Повідомлень від партнера більше немає. Подзвоніть йому!");
          setNoMessagesAvailable(true);
          return;
        }
      }
      if (!response.ok) throw new Error("Failed to fetch message");
      const data = await response.json();
      if (data.message) {
        const newMessage: MessageWithKey = {
          ...data.message,
          shownAt: new Date(data.message.shownAt).toISOString(),
        };
        triggerConfetti();
        setTodayMessages((messages) => [newMessage, ...messages]);
        setMessageCount((count) => count + 1);
      }
    } catch (error) {
      console.error("Failed to fetch message", error);
      toast.error("Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [fetchMessages, messageCount, settings]);

  const handleLikeChange = useCallback(async (id: string, liked: boolean) => {
    try {
      const response = await fetch("/api/messages/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageKey: id, liked }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не вдалося оновити вподобання");
      setTodayMessages((messages) =>
        messages.map((message) => (message._key === id ? { ...message, like: liked } : message)),
      );
      setPreviousMessages((messages) =>
        messages.map((message) => (message._key === id ? { ...message, like: liked } : message)),
      );
    } catch (error) {
      console.error("Не вдалося оновити вподобання", error);
      toast.error("Не вдалося оновити статус вподобання");
    }
  }, []);

  return {
    settings,
    todayMessages,
    previousMessages,
    messageCount,
    getNewMessage,
    handleLikeChange,
    isLoading,
    noMessagesAvailable,
  };
}
