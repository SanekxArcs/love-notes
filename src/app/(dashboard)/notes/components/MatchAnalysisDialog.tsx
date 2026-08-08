"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  FileHeart,
  HeartHandshake,
  Lightbulb,
  LoaderCircle,
  MessageCircleHeart,
  Puzzle,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MatchAnalysisDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface SavedAnalysis {
  text: string;
  generatedAt: string;
  ownNotesCount: number;
  partnerNotesCount: number;
}

interface AnalysisSection {
  title: string;
  body: string;
}

const sectionStyles = [
  {
    icon: MessageCircleHeart,
    iconClass: "bg-pink-100 text-pink-700 dark:bg-pink-950/45 dark:text-pink-200",
  },
  {
    icon: Puzzle,
    iconClass:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/45 dark:text-violet-200",
  },
  {
    icon: Sparkles,
    iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/45 dark:text-amber-200",
  },
  {
    icon: Lightbulb,
    iconClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-200",
  },
] as const;

function parseAnalysis(text: string): AnalysisSection[] {
  const sections: AnalysisSection[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const heading = line.match(
      /^[1-4][).]\s+((?:Спільні інтереси|Що доповнює|На що варто|Практичні поради).*)$/i,
    );

    if (heading) {
      if (current) {
        sections.push({
          title: current.title,
          body: current.lines.join("\n").trim(),
        });
      }

      const [title, ...inlineBody] = heading[1].split(/\s+[—–-]\s+/);
      current = {
        title: title.trim(),
        lines: inlineBody.length ? [inlineBody.join(" — ").trim()] : [],
      };
    } else if (current && line) {
      current.lines.push(line);
    }
  }

  if (current) {
    sections.push({
      title: current.title,
      body: current.lines.join("\n").trim(),
    });
  }

  return sections.length > 1
    ? sections
    : [{ title: "Ваш результат", body: text.trim() }];
}

export default function MatchAnalysisDialog({
  isOpen,
  setIsOpen,
}: MatchAnalysisDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [result, setResult] = useState<SavedAnalysis | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const loadSavedAnalysis = async () => {
      setIsLoadingSaved(true);
      try {
        const response = await fetch("/api/notes/match", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити аналіз");
        }

        setResult(data.analysis ?? null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Error loading saved match analysis:", error);
        toast.error("Не вдалося завантажити збережений аналіз");
      } finally {
        if (!controller.signal.aborted) setIsLoadingSaved(false);
      }
    };

    loadSavedAnalysis();
    return () => controller.abort();
  }, [isOpen]);

  const sections = useMemo(
    () => (result ? parseAnalysis(result.text) : []),
    [result],
  );

  const generatedLabel = useMemo(() => {
    if (!result?.generatedAt) return null;
    return new Intl.DateTimeFormat("uk-UA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(result.generatedAt));
  }, [result?.generatedAt]);

  const runAnalysis = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/notes/match", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Не вдалося виконати аналіз сумісності");
        return;
      }

      setResult(data.analysis);
      toast.success("Аналіз оновлено та збережено");
    } catch (error) {
      console.error("Error running match analysis:", error);
      toast.error("Не вдалося виконати аналіз сумісності");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="h-11 w-full rounded-[1rem] border border-white/70 bg-white/45 px-3 text-xs dark:border-white/10 dark:bg-white/7"
        >
          <HeartHandshake className="h-4 w-4" /> Сумісність
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[90svh] overflow-y-auto rounded-[1.75rem] border-white/65 bg-white/82 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_20px_60px_rgba(71,40,62,.18)] backdrop-blur-2xl sm:max-w-xl dark:border-white/15 dark:bg-zinc-950/86">
        <DialogHeader className="text-left">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-[1.05rem] bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[0_8px_20px_rgba(207,49,112,.24)]">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <DialogTitle>Аналіз сумісності</DialogTitle>
          <DialogDescription>
            Спільні сильні сторони, відмінності та конкретні ідеї для ваших
            стосунків.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSaved ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-pink-600 dark:text-pink-300" />
            <p className="text-sm text-muted-foreground">
              Завантажуємо збережений аналіз…
            </p>
          </div>
        ) : isGenerating ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-[1.4rem] border border-pink-200/60 bg-pink-50/40 px-6 text-center dark:border-pink-400/15 dark:bg-pink-950/15">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-pink-400/25" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/55 dark:text-pink-200">
                <HeartHandshake className="h-6 w-6" />
              </span>
            </div>
            <p className="font-medium">Зіставляємо ваші історії…</p>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              AI аналізує нотатки з обох сторін. Новий результат автоматично
              збережеться у твоєму профілі.
            </p>
          </div>
        ) : result ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
              {generatedLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/50 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/7">
                  <CalendarClock className="h-3.5 w-3.5 text-pink-600 dark:text-pink-300" />
                  {generatedLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/50 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/7">
                <FileHeart className="h-3.5 w-3.5 text-pink-600 dark:text-pink-300" />
                {result.ownNotesCount} твоїх · {result.partnerNotesCount} від
                партнера
              </span>
            </div>

            <div className="grid gap-3">
              {sections.map((section, index) => {
                const style = sectionStyles[index % sectionStyles.length];
                const Icon = style.icon;
                return (
                  <article
                    key={section.title}
                    className="rounded-[1.35rem] border border-white/65 bg-white/48 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.85),0_7px_20px_rgba(71,40,62,.07)] dark:border-white/10 dark:bg-white/6"
                  >
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[.9rem] ${style.iconClass}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold leading-5">
                        {section.title}
                      </h3>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {section.body}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-pink-200/55 bg-pink-50/35 p-3 dark:border-pink-400/15 dark:bg-pink-950/12">
              <p className="text-xs leading-5 text-muted-foreground">
                Результат збережено. Онови його після важливих змін у нотатках.
              </p>
              <Button
                variant="outline"
                onClick={runAnalysis}
                className="h-10 shrink-0 rounded-[.9rem] border-white/70 bg-white/55 px-3 dark:border-white/10 dark:bg-white/7"
                disabled={isGenerating}
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Оновити</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[1.4rem] border border-pink-200/60 bg-pink-50/35 px-6 py-8 text-center dark:border-pink-400/15 dark:bg-pink-950/12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/55 dark:text-pink-200">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium">Дізнайтеся, як ви доповнюєте одне одного</p>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                AI прочитає твої нотатки про партнера та нотатки про тебе, якими
                партнер поділився. Результат збережеться після створення.
              </p>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={isGenerating}
              className="h-11 rounded-[1rem] bg-pink-600 px-5 text-white hover:bg-pink-500"
            >
              <Sparkles className="h-4 w-4" /> Почати аналіз
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
