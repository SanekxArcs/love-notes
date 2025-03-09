"use client";

import { useState } from "react";
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
import { Message } from "../messages/types";
import { LoaderCircle, ArrowUp, ArrowDown } from "lucide-react";


interface MessageHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

type SortDirection = "asc" | "desc";
type SortField = "date" | "name" | "category";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

export default function MessageHistory({ messages, isLoading }: MessageHistoryProps) {
  const [sort, setSort] = useState<SortState>({
    field: "date",
    direction: "desc"
  });
  
  const shownMessages = messages.filter(message => message.isShown);

  const sortedMessages = [...shownMessages].sort((a, b) => {
    if (sort.field === "date") {
      const dateA = a.shownAt ? new Date(a.shownAt).getTime() : 0;
      const dateB = b.shownAt ? new Date(b.shownAt).getTime() : 0;
      return sort.direction === "asc" ? dateA - dateB : dateB - dateA;
    } 
    else if (sort.field === "name") {
      const nameA = (a.userName || "").toLowerCase();
      const nameB = (b.userName || "").toLowerCase();
      return sort.direction === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } 
    else if (sort.field === "category") {
      const catA = a.category || "";
      const catB = b.category || "";
      return sort.direction === "asc"
        ? catA.localeCompare(catB)
        : catB.localeCompare(catA);
    }
    return 0;
  });

  const handleHeaderClick = (field: SortField) => {
    setSort(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === "asc" 
        ? "desc" 
        : "asc"
    }));
  };

  const renderSortIndicator = (field: SortField) => {
    if (sort.field !== field) return null;
    
    return sort.direction === "asc" 
      ? <ArrowUp size={16} /> 
      : <ArrowDown size={16} />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-end items-center select-none">
          <p className="text-sm text-muted-foreground flex justify-end  items-center text-nowrap">
            Кількість:
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
                <TableHead className="flex-1 select-none">Повідомлення</TableHead>
                <TableHead
                  className="max-w-fit text-center cursor-pointer transition-colors"
                  onClick={() => handleHeaderClick("name")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Імя
                    {renderSortIndicator("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="max-w-fit text-center cursor-pointer transition-colors"
                  onClick={() => handleHeaderClick("category")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Категорія
                    {renderSortIndicator("category")}
                  </div>
                </TableHead>
                <TableHead
                  className="max-w-fit text-center cursor-pointer transition-colors"
                  onClick={() => handleHeaderClick("date")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Дата показу
                    {renderSortIndicator("date")}
                  </div>
                </TableHead>
                <TableHead className="text-end w-20">Реакція</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMessages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    Немає історії показаних повідомлень.
                  </TableCell>
                </TableRow>
              ) : (
                sortedMessages.map((message) => (
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
                        ? format(new Date(message.shownAt), "d.MM HH:mm", {
                            locale: uk,
                          })
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
