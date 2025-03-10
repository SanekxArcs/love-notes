import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { triggerConfetti } from '@/lib/confetti';

interface Message {
  _id: string;
  text: string;
  category: "daily" | "extra" | "unknown";
  like: boolean;
  lastShownAt: Date;
  shownAt?: string;
  isToday?: boolean;
}
interface ApiMessage {
          _id: string;
          text: string;
          category: "daily" | "extra" | "unknown";
          like: boolean;
          shownAt: string;
          isToday?: boolean;
        }
export function useMessages(partnerId: string, dailyLimit: number) {
  const [todayMessages, setTodayMessages] = useState<Message[]>([]);
  const [previousMessages, setPreviousMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [noMessagesAvailable, setNoMessagesAvailable] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      // Only fetch if partner ID exists
      if (!partnerId) {
        return;
      }
      
      const response = await fetch(`/api/messages/history?partnerId=${partnerId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      
      const data = await response.json();
      
      if (data.todayMessages) {
        

        setTodayMessages(data.todayMessages.map((msg: ApiMessage): Message => ({
          ...msg,
          lastShownAt: new Date(msg.shownAt)
        })));
        setMessageCount(data.todayMessages.length);
      }
      
      if (data.previousMessages) {
        setPreviousMessages(data.previousMessages.map((msg: ApiMessage): Message => ({
          ...msg,
          lastShownAt: new Date(msg.shownAt)
        })));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  }, [partnerId]);

  const getNewMessage = useCallback(async () => {
    if (messageCount >= dailyLimit) {
      toast.info("You've reached your daily message limit");
      return;
    }

    // Check if partner ID exists
    if (!partnerId) {
      toast.error(
        "ID партнера не встановлено. Відвідайте сторінку допомоги, щоб дізнатися, як встановити ID партнера."
      );
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/messages/random?partnerId=${partnerId}`);
      
      // Handle specific "no messages available" error
      if (response.status === 404) {
        const errorData = await response.json();
        
        // Check if this is specifically a "no messages" error
        if (errorData.error && errorData.error.includes('No unshown messages')) {
          toast.error("😢 Повідомлень від партнера більше немає. Подзвоніть йому!");
          setNoMessagesAvailable(true);
          setIsLoading(false);
          return;
        }
      }
      
      if (!response.ok) throw new Error("Failed to get message");
      
      const data = await response.json();
      
      if (data.message) {
        const newMessage: Message = {
          ...data.message,
          lastShownAt: new Date(data.message.shownAt)
        };
        
        // Trigger confetti effect
        triggerConfetti();
        
        // Add to today's messages
        setTodayMessages(prev => [newMessage, ...prev]);
        setMessageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error getting new message:", error);
      toast.error("Failed to get a new message");
    } finally {
      setIsLoading(false);
    }
  }, [messageCount, dailyLimit, partnerId]);

  const handleLikeChange = useCallback(async (id: string, liked: boolean) => {
    try {
      const response = await fetch("/api/messages/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, liked }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update like status");
      }

      // Update local state
      setTodayMessages(prev => 
        prev.map(msg => msg._id === id ? { ...msg, like: liked } : msg)
      );
      
      setPreviousMessages(prev => 
        prev.map(msg => msg._id === id ? { ...msg, like: liked } : msg)
      );
    } catch (error) {
      console.error("Error updating like status:", error);
      toast.error("Failed to update like status");
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
