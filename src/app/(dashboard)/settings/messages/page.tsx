"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import MessageList from "./components/MessageList";
import MessageHistory from "./components/MessageHistory";
import AddMessageDialog from "./components/AddMessageDialog";
import BatchAddDialog from "./components/BatchAddDialog";
import { Message, EditMessagePayload } from "./types";

// Define interface for new message input
interface NewMessage {
  text: string;
  category: string;
  isShown?: boolean;
  like?: boolean;
}

// Update BatchMessageData interface to match what the API expects
interface BatchMessageData {
  messages: string[];
  category?: string;
  isShown?: boolean;
  like?: boolean;
}

export default function AdminMessages() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  // Redirect if not loading and not admin
  if (status !== "loading" && session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      // Fetch messages
      const messagesResponse = await fetch("/api/settings/messages");
      const messagesData = await messagesResponse.json();

      if (messagesData.messages) {
        setMessages(messagesData.messages);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  }

  const handleAddMessage = async (newMessage: NewMessage): Promise<boolean> => {
    try {
      const response = await fetch("/api/settings/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([data.message, ...messages]);
        toast.success("Повідомлення успішно додано!");
        return true;
      } else {
        const errorData = await response.json();
        toast.error(
          `Помилка: ${errorData.error || "Не вдалося додати повідомлення"}`
        );
        return false;
      }
    } catch (error) {
      console.error("Error adding message:", error);
      toast.error("Сталася помилка під час додавання повідомлення");
      return false;
    }
  };

  const handleBatchAdd = async (data: BatchMessageData): Promise<boolean> => {
    try {
      const response = await fetch("/api/settings/messages/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...data.messages, ...messages]);
        toast.success(`Успішно додано ${data.count} повідомлень!`);
        //reload component
        fetchMessages();
        return true;
      } else {
        const errorData = await response.json();
        toast.error(
          `Помилка: ${errorData.error || "Не вдалося додати повідомлення"}`
        );
        return false;
      }
    } catch (error) {
      console.error("Error batch uploading messages:", error);
      toast.error("Сталася помилка під час додавання повідомлень");
      return false;
    }
  };

  const handleEditMessage = async (
    editedMessage: EditMessagePayload
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/settings/messages?id=${editedMessage._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedMessage),
        }
      );

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(
          messages.map((msg) =>
            msg._id === editedMessage._id ? updatedMessage.message : msg
          )
        );
        toast.success("Повідомлення успішно оновлено!");
        return true;
      } else {
        const error = await response.json();
        toast.error(
          `Помилка: ${error.error || "Не вдалося оновити повідомлення"}`
        );
        return false;
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Сталася помилка під час оновлення повідомлення");
      return false;
    }
  };

  const handleDeleteMessage = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/settings/messages?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg._id !== id));
        toast.success("Повідомлення успішно видалено!");
        return true;
      } else {
        const error = await response.json();
        toast.error(
          `Помилка: ${error.error || "Не вдалося видалити повідомлення"}`
        );
        return false;
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Сталася помилка під час видалення повідомлення");
      return false;
    }
  };

  return (
    <div className="container flex flex-col pb-6">
      <div className="flex flex-row justify-between items-center">
        <div className="mb-4 flex flex-col w-full md:flex-row justify-start items-start gap-4">
          <div className="flex flex-row items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="md:text-2xl font-bold">Керування повідомленнями</h1>
          </div>

          <div className="grid grid-cols-2 w-full gap-4">
            <BatchAddDialog
              isOpen={isBatchDialogOpen}
              setIsOpen={setIsBatchDialogOpen}
              onSubmit={handleBatchAdd}
            />
            <AddMessageDialog
              isOpen={isAddDialogOpen}
              setIsOpen={setIsAddDialogOpen}
              onSubmit={handleAddMessage}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-between">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
        />

        <div className="mt-6">
          <MessageHistory messages={messages} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
