// app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoveMessageCard } from "@/components/ui-app/love-message-card";
import { Heart, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: session } = useSession({ required: true });
  const [todayMessage, setTodayMessage] = useState(null);
  const [extraMessages, setExtraMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [remainingTime, setRemainingTime] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [settings, setSettings] = useState({
    dailyMessageLimit: 3,
    contactNumber: "+380123456789",
  });

  useEffect(() => {
    // For now, load sample data, later replace with Sanity API calls
    fetchSampleData();

    // Set up timer
    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, []);

  function fetchSampleData() {
    // Sample data - replace with actual API calls to Sanity
    setTodayMessage({
      id: "1",
      text: "Кожного ранку я прокидаюся вдячний за те, що ти моя. Твоє кохання - найбільший дарунок.",
      createdAt: new Date(),
    });
    setExtraMessages([
      {
        id: "2",
        text: "Ти не просто моє кохання, ти мій найкращий друг і моя найбільша пригода.",
        createdAt: new Date(Date.now() - 3600000),
      },
    ]);
    setMessageHistory([
      {
        id: "3",
        text: "Моє улюблене місце у світі - поруч з тобою.",
        createdAt: new Date(Date.now() - 86400000),
        isExtraMessage: false,
      },
      {
        id: "4",
        text: "З тобою навіть звичайні моменти стають надзвичайними спогадами.",
        createdAt: new Date(Date.now() - 172800000),
        isExtraMessage: true,
      },
    ]);
    setMessageCount(1 + extraMessages.length);
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
    if (messageCount >= settings.dailyMessageLimit) return;

    const newMessage = {
      id: `extra-${Date.now()}`,
      text: "Ти змушуєш моє серце битися частіше, навіть після всього цього часу.",
      createdAt: new Date(),
    };

    setExtraMessages([newMessage, ...extraMessages]);
    setMessageCount((prev) => prev + 1);
  }

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4"><motion.div
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
                >
                  <Heart className="mr-2 h-5 w-5" /> Мені потрібне кохання зараз
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

      {todayMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <LoveMessageCard
            message={todayMessage.text}
            date={todayMessage.createdAt}
            isToday={true}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 grid gap-4"
      >
        {extraMessages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <LoveMessageCard
              message={msg.text}
              date={msg.createdAt}
              isToday={true}
              isExtraMessage={true}
            />
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Історія повідомлень
        </h2>
        <div className="grid gap-4">
          {messageHistory.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <LoveMessageCard
                message={msg.text}
                date={msg.createdAt}
                isToday={false}
                isExtraMessage={msg.isExtraMessage}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
