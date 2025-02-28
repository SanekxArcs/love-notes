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

export default function MessageHistory({ history, isLoading }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Історія повідомлень</h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4 text-gray-500">
            Завантаження історії повідомлень...
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Повідомлення</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>Користувач</TableHead>
                <TableHead>Дата показу</TableHead>
                <TableHead>Реакція</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    Немає історії повідомлень.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((historyItem) => (
                  <TableRow key={historyItem._id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {historyItem.messageId?.text || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          historyItem.messageId?.category === "daily"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {historyItem.messageId?.category === "daily"
                          ? "Щоденне"
                          : "Додаткове"}
                      </span>
                    </TableCell>
                    <TableCell>{historyItem.userId}</TableCell>
                    <TableCell>
                      {historyItem.shownAt
                        ? format(
                            new Date(historyItem.shownAt),
                            "d MMMM yyyy HH:mm",
                            {
                              locale: uk,
                            }
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          historyItem.messageId?.like
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {historyItem.messageId?.like
                          ? "❤️ Подобається"
                          : "🤍 Без реакції"}
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
