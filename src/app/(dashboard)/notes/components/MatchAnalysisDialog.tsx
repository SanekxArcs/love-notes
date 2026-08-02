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
        <Button variant="secondary" className="w-full sm:w-auto">
          <HeartHandshake className="mr-2 h-4 w-4" /> Перевірити сумісність
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar">
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
              className="w-full sm:w-auto sm:self-end"
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
            <Button onClick={runAnalysis} disabled={isLoading}>
              <HeartHandshake className="mr-2 h-4 w-4" /> Почати аналіз
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
