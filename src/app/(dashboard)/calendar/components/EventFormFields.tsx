"use client";

import { useId, useState } from "react";
import { CalendarDays, Clock3, Flame, Star } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_OPTIONS,
  HIGHLIGHT_OPTIONS,
  MOOD_OPTIONS,
  PROTECTION_OPTIONS,
  type CalendarEventType,
  type Highlight,
  type IntimateActivity,
  type NewCalendarEvent,
} from "../types";

interface EventFormFieldsProps {
  form: NewCalendarEvent;
  setForm: (form: NewCalendarEvent) => void;
  onTypeChange: (type: CalendarEventType) => void;
}

export default function EventFormFields({
  form,
  setForm,
  onTypeChange,
}: EventFormFieldsProps) {
  const dateId = useId();
  const timeId = useId();
  const titleId = useId();
  const recurringId = useId();
  const noteId = useId();

  return (
    <>
      <div className="grid gap-2">
        <Label>Тип події</Label>
        <Select value={form.type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full rounded-[.9rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="important">
              🎉 Важлива/романтична подія
            </SelectItem>
            <SelectItem value="intimate">💞 Інтимний момент</SelectItem>
            <SelectItem value="daily">📝 Щоденний момент</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={dateId}>Дата</Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-pink-600 dark:text-pink-300" />
            <Input
              id={dateId}
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="h-12 rounded-[1rem] border-white/70 bg-white/52 pr-3 pl-10 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7 dark:[color-scheme:dark]"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={timeId}>Час (необов&apos;язково)</Label>
          <div className="relative">
            <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-pink-600 dark:text-pink-300" />
            <Input
              id={timeId}
              type="time"
              value={form.time || ""}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="h-12 rounded-[1rem] border-white/70 bg-white/52 pr-3 pl-10 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7 dark:[color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {form.type === "important" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor={titleId}>Назва</Label>
            <Input
              id={titleId}
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Наприклад, Річниця стосунків"
              required
              className="h-12 rounded-[1rem] border-white/70 bg-white/52 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
            />
          </div>
          <div className="flex items-center justify-between rounded-[1.15rem] border border-white/65 bg-white/42 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-0.5">
              <Label htmlFor={recurringId}>Повторюється щороку</Label>
              <p className="text-xs text-muted-foreground">
                День і місяць стануть пріоритетними щороку
              </p>
            </div>
            <Switch
              id={recurringId}
              checked={form.isRecurringYearly}
              onCheckedChange={(checked) =>
                setForm({ ...form, isRecurringYearly: checked })
              }
            />
          </div>
        </>
      )}

      {form.type === "intimate" && <IntimateFields form={form} setForm={setForm} />}

      {(form.type === "daily" || form.type === "intimate") && (
        <div className="grid gap-2">
          <Label>Настрій</Label>
          <Select
            value={form.mood}
            onValueChange={(value) =>
              setForm({ ...form, mood: value as NewCalendarEvent["mood"] })
            }
          >
            <SelectTrigger className="w-full rounded-[.9rem]">
              <SelectValue placeholder="Як почуваєшся?" />
            </SelectTrigger>
            <SelectContent>
              {MOOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor={noteId}>Нотатка</Label>
        <Textarea
          id={noteId}
          rows={3}
          value={form.note || ""}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Довільні деталі, спогади, думки..."
          className="min-h-24 resize-none rounded-[1rem] border-white/70 bg-white/52 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
        />
      </div>
    </>
  );
}

// --- Простий toggle-чіп для мульти-вибору (мобільно-дружній, без "склеєних" країв ToggleGroup) ---
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
        active
          ? "border-pink-400/65 bg-pink-500 text-white shadow-[0_5px_12px_rgba(219,39,119,.18)]"
          : "border-white/70 bg-white/42 hover:bg-white/70 dark:border-white/12 dark:bg-white/5 dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex w-fit gap-0.5 rounded-full border border-white/65 bg-white/42 p-0.5 dark:border-white/10 dark:bg-white/5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-white text-pink-700 shadow-sm dark:bg-white/12 dark:text-pink-200"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// --- Оцінка 1-10: перші 5 — зірки, наступні 5 — вогники (додатковий "тип" понад 5) ---
function RatingPicker({
  value,
  onChange,
}: {
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const filled = (value ?? 0) >= n;
        const Icon = n <= 5 ? Star : Flame;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`Оцінка ${n} з 10`}
            className="rounded-md p-0.5 transition-transform active:scale-90"
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                filled
                  ? n <= 5
                    ? "fill-amber-400 text-amber-400"
                    : "fill-rose-500 text-rose-500"
                  : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
      <span className="ml-1 text-xs text-muted-foreground">
        {value ? `${value}/10` : "—"}
      </span>
    </div>
  );
}

interface IntimateFieldsProps {
  form: NewCalendarEvent;
  setForm: (form: NewCalendarEvent) => void;
}

function IntimateFields({ form, setForm }: IntimateFieldsProps) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const durationId = useId();
  const protectionId = useId();

  const toggleActivity = (activity: IntimateActivity) => {
    const current = form.activities || [];
    const next = current.includes(activity)
      ? current.filter((a) => a !== activity)
      : [...current, activity];
    setForm({ ...form, activities: next });
  };

  const toggleHighlight = (highlight: Highlight) => {
    const current = form.highlights || [];
    const next = current.includes(highlight)
      ? current.filter((h) => h !== highlight)
      : [...current, highlight];
    setForm({ ...form, highlights: next });
  };

  const toggleFinished = (who: "self" | "partner") => {
    const field = who === "self" ? "selfFinished" : "partnerFinished";
    const next = !form[field];
    setForm({ ...form, [field]: next });
    toast(
      who === "self"
        ? next
          ? "🔥 Записано: ти кінчила!"
          : "Ще ні цього разу 😉"
        : next
          ? "💕 Записано: партнер кінчив(ла)!"
          : "Партнер ще ні цього разу 😉"
    );
  };

  return (
    <div className="grid gap-4 rounded-[1.35rem] border border-white/65 bg-white/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] dark:border-white/10 dark:bg-white/4">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Оцінка задоволення</Label>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: "simple", label: "Просто" },
            { value: "advanced", label: "Детально" },
          ]}
        />
      </div>

      <RatingPicker
        value={form.rating}
        onChange={(value) => setForm({ ...form, rating: value })}
      />

      {mode === "advanced" && (
        <>
          <div className="grid gap-2">
            <Label>Типи активності</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  active={Boolean(form.activities?.includes(option.value))}
                  onClick={() => toggleActivity(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor={durationId}>Тривалість (хв)</Label>
              <Input
                id={durationId}
                type="number"
                min={0}
                value={form.durationMinutes ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationMinutes: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="h-12 rounded-[1rem] border-white/70 bg-white/52 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_5px_16px_rgba(71,40,62,.06)] focus-visible:border-pink-300 focus-visible:ring-pink-300/25 dark:border-white/12 dark:bg-white/7"
              />
            </div>
            <div className="grid gap-2">
              <Label>Хто ініціював</Label>
              <Select
                value={form.initiatedBy}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    initiatedBy: value as NewCalendarEvent["initiatedBy"],
                  })
                }
              >
                <SelectTrigger className="w-full rounded-[.9rem]">
                  <SelectValue placeholder="Виберіть" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">Я</SelectItem>
                  <SelectItem value="partner">Партнер</SelectItem>
                  <SelectItem value="mutual">Обоє</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm">Хто кінчив(ла) 💦</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleFinished("self")}
                className={cn(
                  "flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  form.selfFinished
                    ? "border-rose-500 bg-rose-500 text-white shadow-[0_5px_12px_rgba(244,63,94,.18)]"
                    : "border-white/70 bg-white/42 hover:bg-white/70 dark:border-white/12 dark:bg-white/5"
                )}
              >
                {form.selfFinished ? "💖" : "🤍"} Я
              </button>
              <button
                type="button"
                onClick={() => toggleFinished("partner")}
                className={cn(
                  "flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  form.partnerFinished
                    ? "border-rose-500 bg-rose-500 text-white shadow-[0_5px_12px_rgba(244,63,94,.18)]"
                    : "border-white/70 bg-white/42 hover:bg-white/70 dark:border-white/12 dark:bg-white/5"
                )}
              >
                {form.partnerFinished ? "💖" : "🤍"} Партнер
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.15rem] border border-white/65 bg-white/42 p-3 dark:border-white/10 dark:bg-white/5">
            <Label htmlFor={protectionId}>Використано захист</Label>
            <Switch
              id={protectionId}
              checked={form.protectionUsed ?? false}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  protectionUsed: checked,
                  protectionType: checked ? form.protectionType : undefined,
                })
              }
            />
          </div>

          {Boolean(form.protectionUsed) && (
            <div className="grid gap-2">
              <Label>Вид захисту</Label>
              <Select
                value={form.protectionType}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    protectionType: value as NewCalendarEvent["protectionType"],
                  })
                }
              >
                <SelectTrigger className="w-full rounded-[.9rem]">
                  <SelectValue placeholder="Виберіть вид захисту" />
                </SelectTrigger>
                <SelectContent>
                  {PROTECTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Що виділяло цей момент</Label>
            <div className="flex flex-wrap gap-2">
              {HIGHLIGHT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  active={Boolean(form.highlights?.includes(option.value))}
                  onClick={() => toggleHighlight(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
