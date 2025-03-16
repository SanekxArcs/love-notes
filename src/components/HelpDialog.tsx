"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, HelpCircle, Info } from "lucide-react";
import Link from "next/link";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <HelpCircle className="h-5 w-5" /> Потрібна допомога?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Info className="h-6 w-6 text-purple-500" />
            Про Love Notes
          </DialogTitle>
          <DialogDescription>
            Дізнайтеся, як використовувати застосунок та надсилати повідомлення
            коханій людині
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-lg font-medium">
            Що таке Love Notes і для чого це потрібно?
          </p>

          <p>
            <strong>Love Notes</strong> - це особливий простір для пар, який
            перетворює обмін повідомленнями на приємний ритуал і справжню подію
            дня.
          </p>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Heart className="h-4 w-4" /> Як це працює
            </h4>
            <p className="text-sm mt-1">
              Ви створюєте повідомлення для коханої людини, встановлюєте ліміт
              їх показу в день, а ваш партнер отримує їх як теплі сюрпризи
              протягом дня. Оскільки повідомлення вибираються випадково, кожен
              день стає особливим.
            </p>
          </div>
          <p>Детальніше після входу в свій профіль:</p>

          <div className="flex justify-end pt-2">
            {/* <AuthState /> */}
            <Link href="/help">
              <Button
                variant="default"
                className="bg-pink-600 transition-all hover:bg-pink-700 text-white"
              >
                Увійти
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
