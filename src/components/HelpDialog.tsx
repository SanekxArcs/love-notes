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
          size="icon"
          className="h-10 w-10 rounded-[1rem] border border-white/65 bg-white/55 text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_8px_24px_rgba(71,40,62,.14)] backdrop-blur-2xl hover:bg-white/75 hover:text-pink-700 dark:border-white/15 dark:bg-zinc-950/55 dark:text-pink-200 dark:hover:bg-zinc-900/70 dark:hover:text-pink-200"
        >
          <HelpCircle className="h-[1.15rem] w-[1.15rem]" />
          <span className="sr-only">Потрібна допомога?</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-2xl dark:border-white/15 dark:bg-zinc-950/82">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-pink-100 text-pink-700 dark:bg-pink-950/45 dark:text-pink-200">
              <Info className="h-5 w-5" />
            </span>
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

          <div className="rounded-[1.25rem] border border-pink-200/60 bg-pink-50/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] dark:border-pink-400/15 dark:bg-pink-950/20">
            <h4 className="flex items-center gap-2 font-medium text-pink-700 dark:text-pink-300">
              <Heart className="h-4 w-4" /> Як це працює
            </h4>
            <p className="mt-1 text-sm leading-6">
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
                className="h-11 rounded-[1rem] bg-pink-600 px-5 text-white transition-all hover:bg-pink-500"
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
