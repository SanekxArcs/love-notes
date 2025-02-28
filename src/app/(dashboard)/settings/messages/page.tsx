"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import MessageList from "./components/MessageList";
import MessageHistory from "./components/MessageHistory";
import AddMessageDialog from "./components/AddMessageDialog";
import BatchAddDialog from "./components/BatchAddDialog";

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

  const [messages, setMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch messages
      const messagesResponse = await fetch("/api/settings/messages");
      const messagesData = await messagesResponse.json();

      if (messagesData.messages) {
        setMessages(messagesData.messages);
      }
      setIsLoading(false);

      // Fetch message history
      const historyResponse = await fetch("/api/settings/history");
      const historyData = await historyResponse.json();

      if (historyData.history) {
        setMessageHistory(historyData.history);
      }
      setIsHistoryLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
      setIsHistoryLoading(false);
    }
  }

  const handleAddMessage = async (newMessage) => {
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
        toast.error(`Помилка: ${errorData.error || "Не вдалося додати повідомлення"}`);
        return false;
      }
    } catch (error) {
      console.error("Error adding message:", error);
      toast.error("Сталася помилка під час додавання повідомлення");
      return false;
    }
  };

  const handleBatchAdd = async (messagesData) => {
    try {
      const response = await fetch("/api/settings/messages/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagesData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages([...data.messages, ...messages]);
        toast.success(`Успішно додано ${data.messages.length} повідомлень!`);
        return true;
      } else {
        const errorData = await response.json();
        toast.error(`Помилка: ${errorData.error || "Не вдалося додати повідомлення"}`);
        return false;
      }
    } catch (error) {
      console.error("Error batch uploading messages:", error);
      toast.error("Сталася помилка під час додавання повідомлень");
      return false;
    }
  };

  const handleEditMessage = async (editedMessage) => {
    try {
      const response = await fetch(`/api/settings/messages?id=${editedMessage._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedMessage),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(messages.map(msg => 
          msg._id === editedMessage._id ? updatedMessage.message : msg
        ));
        toast.success("Повідомлення успішно оновлено!");
        return true;
      } else {
        const error = await response.json();
        toast.error(`Помилка: ${error.error || "Не вдалося оновити повідомлення"}`);
        return false;
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Сталася помилка під час оновлення повідомлення");
      return false;
    }
  };

  const handleDeleteMessage = async (id) => {
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
        toast.error(`Помилка: ${error.error || "Не вдалося видалити повідомлення"}`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Сталася помилка під час видалення повідомлення");
      return false;
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Керування повідомленнями</h1>
      </div>

      <div className="mb-6 flex justify-between">
        <p className="text-gray-600">
          Додавайте нові повідомлення, які ваша кохана зможе побачити.
        </p>

        <div className="flex gap-2">
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

      <MessageList
        messages={messages}
        isLoading={isLoading}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
      />
      
      <div className="mt-6">
        <MessageHistory
          history={messageHistory}
          isLoading={isHistoryLoading}
        />
      </div>
    </div>
  );
}
