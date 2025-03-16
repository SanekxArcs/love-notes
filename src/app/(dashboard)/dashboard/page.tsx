"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { SpinnerIcon } from "@sanity/icons";
import { MessageList } from "@/components/ui-app/message-list";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useMessages } from "@/hooks/use-messages";
import { useCountdown } from "@/hooks/use-countdown";

export default function Dashboard() {
  const { settings, isLoading: isSettingsLoading } = useUserSettings();

  const {
    todayMessages,
    previousMessages,
    messageCount,
    fetchMessages,
    getNewMessage,
    handleLikeChange,
    isLoading: isMessageLoading,
    noMessagesAvailable,
  } = useMessages(settings.partnerIdToReceiveFrom, settings.dailyMessageLimit);

  const remainingTime = useCountdown();

  useEffect(() => {
    if (settings.partnerIdToReceiveFrom) {
      fetchMessages();
    }
  }, [settings.partnerIdToReceiveFrom, fetchMessages]);

  return (
    <div className="relative container mx-auto max-w-3xl pb-6 px-4">
      <ControlPanel
        remainingTime={remainingTime}
        messageCount={messageCount}
        dailyLimit={settings.dailyMessageLimit}
        contactNumber={settings.contactNumber}
        onGetNewMessage={getNewMessage}
        isSettingsLoading={isSettingsLoading}
        isMessageLoading={isMessageLoading}
        noMessagesAvailable={noMessagesAvailable}
      />

      <MessageList
        title="Сьогоднішні повідомлення"
        messages={todayMessages}
        isToday={true}
        onLikeChange={handleLikeChange}
        animationDelay={0.2}
        isSettingsLoading={isSettingsLoading}
      />

      <MessageList
        title="Історія повідомлень"
        messages={previousMessages}
        isToday={false}
        onLikeChange={handleLikeChange}
        animationDelay={0.5}
        isSettingsLoading={isSettingsLoading}
      />
    </div>
  );
}

interface ControlPanelProps {
  remainingTime: string;
  messageCount: number;
  dailyLimit: number;
  contactNumber: string;
  isSettingsLoading?: boolean;
  isMessageLoading?: boolean;
  onGetNewMessage: () => void;
  noMessagesAvailable: boolean;
}

function ControlPanel({
  remainingTime,
  messageCount,
  dailyLimit,
  contactNumber,
  onGetNewMessage,
  isSettingsLoading,
  isMessageLoading,
  noMessagesAvailable,
}: ControlPanelProps) {
  const showCallButton = messageCount >= dailyLimit || noMessagesAvailable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-indigo-500/10 to-pink-500/10 overflow-hidden">
        <div className="p-6">
          <div className="mb-4 flex items-center flex-col md:flex-row justify-between">
            <div className="flex items-center gap-2 text-indigo-700">
              <Clock className="h-5 w-5" />
              <h3 className="font-medium text-sm md:text-base">
                Наступне повідомлення через:
              </h3>
            </div>
            <div className="text-4xl md:text-lg font-mono font-semibold text-indigo-700">
              {remainingTime}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {!showCallButton ? (
              <Button
                onClick={onGetNewMessage}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isMessageLoading}
              >
                {isSettingsLoading || isMessageLoading ? (
                  <span className="flex items-center animate-pulse">
                    <SpinnerIcon className="animate-spin mr-1" />
                    Завантаження...
                  </span>
                ) : messageCount < 1 ? (
                  <span className="flex items-center">
                    <Heart className="mr-1 h-5 w-5" />
                    Показати повідомлення
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Heart className="mr-1 h-5 w-5" />
                    Хочеться ще!
                    <Heart className="ml-1 h-5 w-5" />
                  </span>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => (window.location.href = `tel:${contactNumber}`)}
                disabled={isMessageLoading}
              >
                {isSettingsLoading ? (
                  <span className="flex items-center animate-pulse">
                    <SpinnerIcon className="animate-spin mr-1" />
                    Завантаження...
                  </span>
                ) : (
                  <>
                    <Phone className="mr-2 h-5 w-5" />
                    {noMessagesAvailable
                      ? "Повідомлення закінчились"
                      : "Зателефонувати партнеру"}
                  </>
                )}
              </Button>
            )}
            {isSettingsLoading ? (
              <p className="text-center bg-pink-500/40 rounded-md animate-pulse text-sm text-transparent">
                Завантаження...
              </p>
            ) : noMessagesAvailable ? (
              <p className="text-center text-sm text-gray-500">
                Всі повідомлення переглянуто 😱
              </p>
            ) : (
              <p className="text-center text-sm text-gray-500">
                Сьогодні використано:{" "}
                {isMessageLoading ? (
                  <span className="w-5 h-5 animate-pulse bg-pink-500/40 rounded-md text-transparent">
                    1
                  </span>
                ) : (
                  messageCount
                )}
                /{dailyLimit}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
