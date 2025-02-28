// app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoveMessageCard } from "@/components/ui-app/love-message-card";
import { Heart, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: session } = useSession({ required: true });
  const [todayMessages, setTodayMessages] = useState([]);
  const [previousMessages, setPreviousMessages] = useState([]);
  const [remainingTime, setRemainingTime] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    dailyMessageLimit: 1,
    contactNumber: "+380123456789",
  });

  useEffect(() => {
    // Load settings and messages on initial page load
    fetchSettings();
    fetchMessages();

    // Set up timer for next message
    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      
      const data = await response.json();
      
      if (data) {
        setSettings({
          dailyMessageLimit: data.dailyMessageLimit || 3,
          contactNumber: data.contactNumber || "+380123456789"
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Keep default settings
    }
  }

  async function fetchMessages() {
    try {
      const response = await fetch("/api/messages/history");
      if (!response.ok) throw new Error("Failed to fetch messages");
      
      const data = await response.json();
      
      if (data.todayMessages) {
        setTodayMessages(data.todayMessages.map(msg => ({
          ...msg,
          lastShownAt: new Date(msg.shownAt)  // Map shownAt to lastShownAt for component compatibility
        })));
        setMessageCount(data.todayMessages.length);
      }
      
      if (data.previousMessages) {
        setPreviousMessages(data.previousMessages.map(msg => ({
          ...msg,
          lastShownAt: new Date(msg.shownAt)  // Map shownAt to lastShownAt for component compatibility
        })));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  }

  function updateRemainingTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setRemainingTime(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  }

  async function getNewLoveMessage() {
    if (messageCount >= settings.dailyMessageLimit) {
      toast.info("You've reached your daily message limit");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/messages/random");
      if (!response.ok) throw new Error("Failed to get message");
      
      const data = await response.json();
      
      if (data.message) {
        const newMessage = {
          ...data.message,
          lastShownAt: new Date(data.message.shownAt)  // Map shownAt to lastShownAt
        };
        
        // Add to today's messages
        setTodayMessages(prev => [newMessage, ...prev]);
        setMessageCount(prev => prev + 1);
        toast.success("New love message received!");
      }
    } catch (error) {
      console.error("Error getting new message:", error);
      toast.error("Failed to get a new message");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLikeChange(id, liked) {
    try {
      console.log(`Sending like update for message ${id} to ${liked}`);
      
      const response = await fetch("/api/messages/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          historyId: id,  // Changed from historyId to messageId
          liked,
        }),
      });
      
      const result = await response.json();
      console.log("Like update response:", result);

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
      
      toast.success(liked ? "Message liked!" : "Like removed");
    } catch (error) {
      console.error("Error updating like status:", error);
      toast.error("Failed to update like status");
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-indigo-500/10 to-pink-500/10 overflow-hidden">
          <div className=" p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Clock className="h-5 w-5" />
                <h3 className="font-medium">Наступне повідомлення через:</h3>
              </div>
              <div className="text-lg font-mono font-semibold text-indigo-700">
                {remainingTime}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {messageCount < settings.dailyMessageLimit ? (
                <Button
                  onClick={getNewLoveMessage}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  <Heart className="mr-2 h-5 w-5" /> 
                  {isLoading ? "Завантаження..." : "Мені потрібне кохання зараз"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() =>
                    (window.location.href = `tel:${settings.contactNumber}`)
                  }
                >
                  <Phone className="mr-2 h-5 w-5" /> Подзвонити коханому
                </Button>
              )}

              <p className="text-center text-sm text-gray-500">
                Сьогодні використано: {messageCount}/
                {settings.dailyMessageLimit}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today's messages */}
      {todayMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid gap-4"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            Сьогоднішні повідомлення
          </h2>
          
          {todayMessages.map((msg, index) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <LoveMessageCard
                id={msg._id}
                message={msg.text}
                date={msg.lastShownAt}
                isToday={true}
                isExtraMessage={msg.category === "extra"}
                initialLikeState={msg.like}
                onLikeChange={handleLikeChange}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Previous messages */}
      {previousMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Історія повідомлень
          </h2>
          <div className="grid gap-4">
            {previousMessages.map((msg, index) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <LoveMessageCard
                  id={msg._id}
                  message={msg.text}
                  date={msg.lastShownAt}
                  isToday={false}
                  isExtraMessage={msg.category === "extra"}
                  initialLikeState={msg.like}
                  onLikeChange={handleLikeChange}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
