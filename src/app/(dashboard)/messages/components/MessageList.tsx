"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CalendarHeart, Inbox, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import EditMessageDialog from "./EditMessageDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import type { EditMessagePayload, Message } from "../types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEdit: (message: EditMessagePayload) => Promise<boolean>;
  onDelete: (key: string) => Promise<boolean>;
  isManageMode: boolean;
  selectedKeys: string[];
  onToggleSelection: (key: string) => void;
}

interface MessageCardProps {
  message: Message;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  isManageMode: boolean;
  isSelected: boolean;
  onToggleSelection: (key: string) => void;
}

function MessageCard({
  message,
  onEdit,
  onDelete,
  isManageMode,
  isSelected,
  onToggleSelection,
}: MessageCardProps) {
  const handleEdit = useCallback(() => onEdit(message), [message, onEdit]);
  const handleDelete = useCallback(() => onDelete(message), [message, onDelete]);
  const handleToggle = useCallback(
    () => onToggleSelection(message._key),
    [message._key, onToggleSelection],
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={`relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/52 p-4 pb-16 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_28px_rgba(71,40,62,.09)] backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/48 ${isSelected ? "ring-2 ring-pink-400/45" : ""}`}
    >
      <div className="pointer-events-none absolute -right-12 -top-14 h-28 w-28 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-700/12" />
      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 flex w-9 shrink-0 flex-col items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[.9rem] border border-white/65 bg-white/55 text-pink-700 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] dark:border-white/12 dark:bg-white/8 dark:text-pink-200">
            <Inbox className="h-4 w-4" />
          </div>
          {isManageMode ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleToggle}
              aria-label="Вибрати повідомлення"
              className="border-pink-300/80 data-[state=checked]:bg-pink-600 data-[state=checked]:text-white dark:border-pink-800/70"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-6 text-zinc-800 dark:text-zinc-100">
            {message.text || "Повідомлення без тексту"}
          </p>
          <div className="mt-3 flex min-h-6 flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full border border-white/60 bg-white/50 px-2 text-[10px] font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300"
            >
              Очікує
            </Badge>
            {message.specificDate ? (
              <Badge className="rounded-full border border-pink-200/60 bg-pink-100/60 px-2 text-[10px] font-semibold text-pink-700 dark:border-pink-900/40 dark:bg-pink-950/30 dark:text-pink-200">
                <CalendarHeart className="mr-1 h-3 w-3" /> {message.specificDate}
              </Badge>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
            {message.createdAt ? (
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                Створено {format(new Date(message.createdAt), "d MMM yyyy, HH:mm", { locale: uk })}
              </span>
            ) : null}
            {message.updatedAt && message.updatedAt !== message.createdAt ? (
              <span>Редаговано {format(new Date(message.updatedAt), "d MMM yyyy, HH:mm", { locale: uk })}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          aria-label="Редагувати повідомлення"
          className="h-9 w-9 rounded-[.9rem] border border-white/65 bg-white/50 text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] hover:bg-white/75 hover:text-pink-700 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Видалити повідомлення"
          className="h-9 w-9 rounded-[.9rem] border border-red-200/60 bg-red-50/50 text-red-500 hover:bg-red-100/70 hover:text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
}

export default function MessageList({
  messages,
  isLoading,
  onEdit,
  onDelete,
  isManageMode,
  selectedKeys,
  onToggleSelection,
}: MessageListProps) {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const unshownMessages = messages.filter((message) => !message.isShown);

  const handleEditClick = useCallback((message: Message) => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((message: Message) => {
    setMessageToDelete(message);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (editedMessage: EditMessagePayload) => {
      const success = await onEdit(editedMessage);
      if (success) setIsEditDialogOpen(false);
      return success;
    },
    [onEdit],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!messageToDelete) return false;
    const success = await onDelete(messageToDelete._key);
    if (success) {
      setIsDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
    return success;
  }, [messageToDelete, onDelete]);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-[.12em] text-zinc-600 dark:text-zinc-300">
            Майбутні листи
          </h2>
          {isManageMode && selectedKeys.length > 0 ? (
            <span className="text-[11px] font-semibold text-pink-700 dark:text-pink-200">
              ({selectedKeys.length} вибрано)
            </span>
          ) : null}
        </div>
        <span className="rounded-full border border-white/60 bg-white/50 px-2 py-0.5 text-[11px] font-semibold text-pink-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:text-pink-200">
          {isLoading ? "…" : unshownMessages.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-36 items-center justify-center rounded-[1.5rem] border border-white/60 bg-white/45 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <LoaderCircle className="h-6 w-6 animate-spin text-pink-600 dark:text-pink-300" />
        </div>
      ) : unshownMessages.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/70 bg-white/35 px-5 py-10 text-center backdrop-blur-xl dark:border-white/12 dark:bg-white/4">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-pink-100/70 text-pink-600 dark:bg-pink-950/30 dark:text-pink-300">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold">Запас листів порожній</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            Створи нове повідомлення, і воно чекатиме свого особливого моменту.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {unshownMessages.map((message) => (
              <MessageCard
                key={message._key}
                message={message}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isManageMode={isManageMode}
                isSelected={selectedKeys.includes(message._key)}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditMessageDialog
        message={editingMessage}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onSubmit={handleEditSubmit}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        message={messageToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
}
