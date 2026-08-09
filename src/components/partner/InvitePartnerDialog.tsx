"use client";

import { type ChangeEvent, useCallback, useEffect, useId, useMemo, useState } from "react";
import { Copy, HeartHandshake, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InvitePartnerDialogProps {
  partnerId: string;
  inviterName: string;
  className?: string;
}

function defaultMessage(inviterName: string, recipientName: string) {
  const greeting = recipientName.trim() ? `Привіт, ${recipientName.trim()}!` : "Привіт!";
  return `${greeting} Я, ${inviterName || "твій партнер"}, запрошую тебе до Love Notes — нашого маленького простору для теплих слів, важливих планів і спогадів. Приєднуйся до мене 💗`;
}

export function InvitePartnerDialog({
  partnerId,
  inviterName,
  className,
}: InvitePartnerDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const recipientId = useId();
  const messageId = useId();

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined" || !partnerId) return "";
    const search = new URLSearchParams({ from: partnerId });
    if (recipientName.trim()) search.set("to", recipientName.trim());
    if (message.trim()) search.set("message", message.trim());
    return `${window.location.origin}/invite?${search.toString()}`;
  }, [message, partnerId, recipientName]);

  useEffect(() => {
    if (open && !message) {
      setMessage(defaultMessage(inviterName, recipientName));
    }
  }, [inviterName, message, open, recipientName]);

  const updateRecipient = useCallback((value: string) => {
    setRecipientName(value);
    if (message === defaultMessage(inviterName, recipientName)) {
      setMessage(defaultMessage(inviterName, value));
    }
  }, [inviterName, message, recipientName]);

  const openDialog = useCallback(() => setOpen(true), []);
  const handleRecipientChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => updateRecipient(event.target.value),
    [updateRecipient],
  );
  const handleMessageChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value),
    [],
  );

  const copyInvite = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Посилання-запрошення скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати посилання");
    }
  }, [inviteUrl]);

  const shareInvite = useCallback(async () => {
    if (!inviteUrl) return;
    if (!navigator.share) {
      await copyInvite();
      return;
    }

    try {
      await navigator.share({
        title: "Запрошення до Love Notes",
        text: message.trim() || defaultMessage(inviterName, recipientName),
        url: inviteUrl,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Не вдалося надіслати запрошення");
      }
    }
  }, [copyInvite, inviteUrl, inviterName, message, recipientName]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        onClick={openDialog}
        disabled={!partnerId}
        className={className ?? "h-11 w-full rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105"}
      >
        <HeartHandshake className="h-4 w-4" /> Запросити партнера
      </Button>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/75 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/80">
        <DialogHeader>
          <DialogTitle>Запросити партнера</DialogTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Створи персональне запрошення — партнер зареєструється за ним і з’єднається з тобою автоматично.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={recipientId}>Ім&apos;я партнера</Label>
            <Input
              id={recipientId}
              value={recipientName}
              onChange={handleRecipientChange}
              placeholder="Наприклад, Вікторія"
              className="h-11 rounded-[1rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={messageId}>Текст запрошення</Label>
            <Textarea
              id={messageId}
              value={message}
              onChange={handleMessageChange}
              className="min-h-32 rounded-[1rem] border-white/70 bg-white/45 dark:border-white/10 dark:bg-white/6"
            />
          </div>
          <p className="rounded-[1rem] border border-pink-100/80 bg-pink-50/55 p-3 text-xs leading-5 text-pink-800 dark:border-pink-400/15 dark:bg-pink-950/20 dark:text-pink-100">
            Посилання містить лише код підключення. Його можна надсилати будь-яким зручним способом.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={copyInvite} className="h-11 rounded-[1rem]">
              <Copy className="h-4 w-4" /> Копіювати
            </Button>
            <Button type="button" onClick={shareInvite} className="h-11 rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white hover:brightness-105">
              <Share2 className="h-4 w-4" /> Надіслати
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
