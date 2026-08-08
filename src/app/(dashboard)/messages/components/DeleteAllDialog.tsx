import { useId, useState } from "react";
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
  const passwordId = useId();

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
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/80">
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
              <Label htmlFor={passwordId}>Пароль</Label>
              <Input
                id={passwordId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль для підтвердження"
                autoComplete="off"
                disabled={isLoading}
                className="h-11 rounded-[1rem] border-white/70 bg-white/45 px-4 dark:border-white/10 dark:bg-white/6"
              />
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2 [&_button]:m-0 [&_button]:rounded-[.9rem]">
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
