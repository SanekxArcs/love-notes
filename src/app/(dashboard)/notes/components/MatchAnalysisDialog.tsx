"use client";

import { useState } from "react";
import { HeartHandshake, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MatchAnalysisDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MatchAnalysisDialog({
  isOpen,
  setIsOpen,
}: MatchAnalysisDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notes/match", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Не вдалося виконати аналіз сумісності");
        return;
      }

      setResult(data.text);
    } catch (error) {
      console.error("Error running match analysis:", error);
      toast.error("Не вдалося виконати аналіз сумісності");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="h-11 w-full rounded-[1rem] border border-white/70 bg-white/45 px-3 text-xs dark:border-white/10 dark:bg-white/7">
          <HeartHandshake className="h-4 w-4" /> Сумісність
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/78 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-lg dark:border-white/15 dark:bg-zinc-950/82">
        <DialogHeader>
          <DialogTitle>Аналіз сумісності</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-2xl">💞</p>
            <p className="text-sm text-muted-foreground">
              AI аналізує ваші нотатки та нотатки партнера...
            </p>
          </div>
        ) : result ? (
          <div className="grid gap-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </p>
            <Button
              variant="outline"
              onClick={runAnalysis}
              className="h-11 w-full rounded-[1rem] border-white/70 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] sm:w-auto sm:self-end dark:border-white/10 dark:bg-white/7"
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Оновити аналіз
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-2xl">💞</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              AI прочитає ваші нотатки про партнера та нотатки про вас,
              якими партнер поділився, і складе глибокий розбір сумісності.
            </p>
            <Button
              onClick={runAnalysis}
              disabled={isLoading}
              className="h-11 rounded-[1rem] bg-pink-600 px-5 text-white hover:bg-pink-500"
            >
              <HeartHandshake className="mr-2 h-4 w-4" /> Почати аналіз
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
