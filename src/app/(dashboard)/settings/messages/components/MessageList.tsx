"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
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
import { EditMessagePayload, Message } from "../types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEdit: (message: EditMessagePayload) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function MessageList({ messages, isLoading, onEdit, onDelete }: MessageListProps) {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const handleEditClick = (message: Message): void => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (message: Message): void => {
    setMessageToDelete(message);
    setIsDeleteDialogOpen(true);
  };

  // Filter for unshown messages only
  const unshownMessages = messages.filter(message => !message.isShown);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Непоказані повідомлення</h2>
          <p className="text-sm text-muted-foreground flex items-center">
            Кількість:{" "}
            {isLoading ? (
                <LoaderCircle className="animate-spin" />
            ) : (
              `${unshownMessages.length}`
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
                <TableHead>Повідомлення</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unshownMessages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    Немає непоказаних повідомлень. Додайте нове повідомлення!
                  </TableCell>
                </TableRow>
              ) : (
                unshownMessages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {message.text || <LoaderCircle className="animate-spin" /> }

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
