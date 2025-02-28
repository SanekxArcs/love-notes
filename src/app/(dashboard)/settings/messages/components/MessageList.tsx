"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditMessageDialog from "./EditMessageDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

export default function MessageList({ messages, isLoading, onEdit, onDelete }) {
  const [editingMessage, setEditingMessage] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditClick = (message) => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Всі повідомлення</h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4 text-gray-500">
            Завантаження повідомлень...
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Повідомлення</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    Немає повідомлень. Додайте перше повідомлення!
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {message.text}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          message.category === "daily"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {message.category === "daily"
                          ? "Щоденне"
                          : message.category === "extra"
                            ? "Додаткове"
                            : "Ніяка ще"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {message.lastShownAt
                        ? format(
                            new Date(message.lastShownAt),
                            "d MMMM yyyy",
                            { locale: uk }
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(message)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(message)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <EditMessageDialog
        message={editingMessage}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen} 
        onSubmit={async (editedMessage) => {
          const success = await onEdit(editedMessage);
          if (success) setIsEditDialogOpen(false);
          return success;
        }}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        message={messageToDelete}
        onConfirm={async () => {
          if (!messageToDelete) return false;
          const success = await onDelete(messageToDelete._id);
          if (success) {
            setIsDeleteDialogOpen(false);
            setMessageToDelete(null);
          }
          return success;
        }}
      />
    </Card>
  );
}
