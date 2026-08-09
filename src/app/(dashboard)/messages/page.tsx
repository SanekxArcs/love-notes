"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Mail, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import MessageList from "./components/MessageList";
import AddMessageDialog from "./components/AddMessageDialog";
import DeleteAllDialog from "./components/DeleteAllDialog";
import type { Message, EditMessagePayload } from "./types";
import { BackButton } from "@/components/ui/back-button";
import { PageContainer } from "@/components/ui/page-container";
import { FirstVisitTour } from "@/components/onboarding/FirstVisitTour";

interface NewMessage {
  text: string;
  category: string;
  isShown?: boolean;
  like?: boolean;
  specificDate?: string;
}

export default function AdminMessages() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
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
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const openDeleteDialog = useCallback(() => setIsDeleteDialogOpen(true), []);
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    [],
  );

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

  const handleEditMessage = async (
    editedMessage: EditMessagePayload
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/settings/messages?key=${editedMessage._key}`,
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
            msg._key === editedMessage._key ? updatedMessage.message : msg
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

  const handleDeleteMessage = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/settings/messages?key=${key}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg._key !== key));
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

  const handleDeleteAllUnshown = async (password: string): Promise<boolean> => {
    try {
      setIsDeletingAll(true);
      
      const response = await fetch("/api/settings/messages/delete-unshown", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(messages.filter(msg => msg.isShown));
        toast.success(`Успішно видалено ${data.count || ''} неопублікованих повідомлень!`);
        return true;
      } else {
        const error = await response.json();
        toast.error(`Помилка: ${error.error || "Не вдалося видалити повідомлення"}`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting unshown messages:", error);
      toast.error("Сталася помилка під час видалення повідомлень");
      return false;
    } finally {
      setIsDeletingAll(false);
    }
  };

  const unshownCount = messages.filter(msg => !msg.isShown).length;

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((message) =>
      message.text.toLowerCase().includes(query)
    );
  }, [messages, search]);

  return (
    <PageContainer>
      <FirstVisitTour tour="messages" />
      <BackButton text="Повідомлення для партнера" />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="mb-4 overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/52 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_12px_34px_rgba(71,40,62,.1)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 dark:bg-zinc-950/48"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_8px_20px_rgba(207,49,112,.24)]">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Запас любові
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Підготуй наступні сюрпризи заздалегідь
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tracking-tight text-pink-700 dark:text-pink-200">
              {unshownCount}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              очікують
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <AddMessageDialog
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
            existingTexts={messages.map((msg) => msg.text)}
            onSubmit={handleAddMessage}
          />
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-[1rem] border-white/70 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-white/10 dark:bg-white/8"
          >
            <Link href="/history">
              <History className="h-4 w-4" /> Історія
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openDeleteDialog}
            disabled={unshownCount === 0}
            className="col-span-2 h-11 rounded-[1rem] border-red-200/70 bg-red-50/45 text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] hover:bg-red-100/60 hover:text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
          >
            <Trash2 className="h-4 w-4" /> Очистити
          </Button>
        </div>
      </motion.section>

      <DeleteAllDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAllUnshown}
        isLoading={isDeletingAll}
      />

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
            {filteredMessages.length}
          </span>
        ) : null}
      </div>

      <MessageList
        messages={filteredMessages}
        isLoading={isLoading}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
      />
    </PageContainer>
  );
}
