import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { triggerConfetti } from '@/lib/confetti';
import type { Message } from '@/sanity/types';

export type MessageWithKey = Message & { _key: string };

export function useMessages(partnerId: string, dailyLimit: number) {
  const [todayMessages, setTodayMessages] = useState<MessageWithKey[]>([]);
  const [previousMessages, setPreviousMessages] = useState<MessageWithKey[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [noMessagesAvailable, setNoMessagesAvailable] = useState(false);

  // Define toast messages
  const toastTextError = "Failed to fetch messages";
  const toastTextErrorID = "ID партнера не встановлено. Відвідайте сторінку допомоги, щоб дізнатися, як встановити ID партнера.";
  const toastDaylyLimit = "Досягнуто денний ліміт повідомлень";
  const toastNoMessages = "😢 Повідомлень від партнера більше немає. Подзвоніть йому!";
  const toastLikeError = "Не вдалося оновити статус вподобання";

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!partnerId) {
        return;
      }
      
      const response = await fetch("/api/messages/history");
      if (!response.ok) throw new Error(toastTextError);
      
      const data = await response.json();
      
      if (data.todayMessages) {

        setTodayMessages(
          data.todayMessages.map(
            (msg: MessageWithKey): MessageWithKey => ({
              ...msg,
              shownAt: msg.shownAt ? new Date(msg.shownAt).toISOString() : new Date().toISOString(),
            })
          )
        );
        setMessageCount(data.todayMessages.length);
      }

      setNoMessagesAvailable(false);

      if (data.previousMessages) {
        setPreviousMessages(
          data.previousMessages.map(
            (msg: MessageWithKey): MessageWithKey => ({
              ...msg,
              shownAt: msg.shownAt ? new Date(msg.shownAt).toISOString() : new Date().toISOString(),
            })
          )
        );
      }
    } catch (error) {
      console.error(toastTextError, error);
      toast.error(toastTextError);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  const getNewMessage = useCallback(async () => {
    if (messageCount >= dailyLimit) {
      toast.info(toastDaylyLimit);
      return;
    }

    if (!partnerId) {
      toast.error(toastTextErrorID);
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
            ? toastDaylyLimit
            : errorData.error || "Стан повідомлень змінився. Спробуйте ще раз.",
        );
        return;
      }
      
      if (response.status === 404) {
        const errorData = await response.json();
        
        if (errorData.error?.includes('No unshown messages')) {
          toast.error(toastNoMessages);
          setNoMessagesAvailable(true);
          setIsLoading(false);
          return;
        }
      }
      
      if (!response.ok) throw new Error(toastTextError);
      
      const data = await response.json();
      
      if (data.message) {
        const newMessage: MessageWithKey = {
          ...data.message,
          shownAt: new Date(data.message.shownAt).toISOString()
        };
        
        triggerConfetti();
        
        setTodayMessages(prev => [newMessage, ...prev]);
        setMessageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error(toastTextError, error);
      toast.error(toastTextError);
    } finally {
      setIsLoading(false);
    }
  }, [messageCount, dailyLimit, partnerId, fetchMessages]);

  const handleLikeChange = useCallback(async (id: string, liked: boolean) => {
    try {
      const response = await fetch("/api/messages/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageKey: id, liked }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || toastLikeError);
      }

      setTodayMessages(prev =>
        prev.map(msg => msg._key === id ? { ...msg, like: liked } : msg)
      );

      setPreviousMessages(prev =>
        prev.map(msg => msg._key === id ? { ...msg, like: liked } : msg)
      );
    } catch (error) {
      console.error(toastLikeError, error);
      toast.error(toastLikeError);
    }
  }, []);

  return {
    todayMessages,
    previousMessages,
    messageCount,
    fetchMessages,
    getNewMessage,
    handleLikeChange,
    isLoading,
    noMessagesAvailable
  };
}
