"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Message } from "../types";
import { LoaderCircle } from "lucide-react";

interface MessageHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageHistory({ messages, isLoading }: MessageHistoryProps) {
  // Filter for shown messages only
  const shownMessages = messages.filter(message => message.isShown);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Історія повідомлень</h2>
          <p className="text-sm text-muted-foreground flex items-center">
            Кількість:{" "}
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              `${shownMessages.length}`
            )}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center animate-spin py-4 text-gray-500 flex items-center justify-center">
            <LoaderCircle />
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex-1">Повідомлення</TableHead>
                <TableHead className="max-w-fit text-center">Імя</TableHead>
                <TableHead className="max-w-fit text-center">
                  Категорія
                </TableHead>
                <TableHead className="max-w-fit text-center">
                  Дата показу
                </TableHead>
                <TableHead className="text-end w-20">Реакція</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shownMessages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-gray-500"
                  >
                    Немає історії показаних повідомлень.
                  </TableCell>
                </TableRow>
              ) : (
                shownMessages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {message.text || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {message.userName || "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          message.category === "daily"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {message.category === "daily" ? "Щоденне" : "Додаткове"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {message.shownAt
                        ? format(
                            new Date(message.shownAt),
                            "d MMMM yyyy HH:mm",
                            {
                              locale: uk,
                            }
                          )
                        : "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          message.like
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.like ? "❤️" : "🤍"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
