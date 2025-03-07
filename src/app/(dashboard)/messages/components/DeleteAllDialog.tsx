import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";

interface DeleteAllDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: (password: string) => Promise<boolean>;
  isLoading?: boolean;
}

export default function DeleteAllDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  isLoading = false,
}: DeleteAllDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Введіть пароль для підтвердження");
      return;
    }

    const result = await onConfirm(password);
    if (result) {
      setPassword("");
      setIsOpen(false);
    } else {
      setError("Невірний пароль або помилка видалення");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Видалити всі неопубліковані повідомлення</DialogTitle>
          <DialogDescription>
            Ця дія видалить всі повідомлення, які ще не було показано. Для
            підтвердження введіть пароль.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль для підтвердження"
                autoComplete="off"
                disabled={isLoading}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4" />
                  <span className=" animate-pulse">Видалення...</span>
                </>
              ) : (
                "Видалити"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
