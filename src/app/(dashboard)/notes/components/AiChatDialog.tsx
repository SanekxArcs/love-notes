"use client";

import { useRef, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import type { ChatTurn } from "../types";

type ChatMessage = ChatTurn & { id: string };

const SUGGESTIONS = [
  "Що подарувати на річницю?",
  "Придумай ідею для несподіваного побачення",
  "Що можна приготувати, спираючись на нотатки?",
];

export default function AiChatDialog({ isOpen, setIsOpen }: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const nextId = useRef(0);

  const makeId = () => {
    nextId.current += 1;
    return `msg-${nextId.current}`;
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const nextHistory: ChatMessage[] = [
      ...messages,
      { id: makeId(), role: "user", text: trimmed },
    ];
    setMessages(nextHistory);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/notes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: nextHistory.map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Не вдалося отримати відповідь від AI");
        return;
      }

      setMessages([...nextHistory, { id: makeId(), role: "model", text: data.text }]);
    } catch (error) {
      console.error("Error sending chat message:", error);
      toast.error("Не вдалося отримати відповідь від AI");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Sparkles className="mr-2 h-4 w-4" /> AI-помічник
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[80vh] max-h-[700px] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="flex-row items-center justify-between gap-2 border-b p-4 space-y-0">
          <DialogTitle>AI-помічник</DialogTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessages([])}
              aria-label="Очистити чат"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport className="px-4 py-4 custom-scrollbar">
              <MessageScrollerContent>
                {messages.length === 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Запитай щось про партнера — AI відповість, спираючись на
                      твої нотатки.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => sendMessage(suggestion)}
                          className="w-fit rounded-full border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={message.id}>
                    <Message align={message.role === "user" ? "end" : "start"}>
                      <MessageContent>
                        <Bubble
                          align={message.role === "user" ? "end" : "start"}
                          variant={message.role === "user" ? "default" : "secondary"}
                        >
                          <BubbleContent className="whitespace-pre-wrap">
                            {message.text}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}

                {isSending && (
                  <MessageScrollerItem>
                    <Marker>
                      <MarkerContent className="shimmer">Думаю...</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="end" />
          </MessageScroller>
        </MessageScrollerProvider>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Напиши питання..."
            rows={1}
            className="min-h-9 resize-none"
          />
          <Button type="submit" disabled={isSending || !input.trim()}>
            Надіслати
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
