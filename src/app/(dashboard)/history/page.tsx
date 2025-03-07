"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import MessageHistory from "./MessageHistory";
import { Message } from "../messages/types";
import { LoaderCircle } from "lucide-react";

export default function HistoryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Історія повідомлень</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoaderCircle className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <MessageHistory messages={messages} isLoading={isLoading} />
      )}
    </div>
  );
}
