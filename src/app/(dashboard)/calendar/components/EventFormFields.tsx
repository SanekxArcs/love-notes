"use client";

import { useState } from "react";
import { Flame, Star } from "lucide-react";
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
  return (
    <>
      <div className="grid gap-2">
        <Label>Тип події</Label>
        <Select value={form.type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full">
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

      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="date">Дата</Label>
          <Input
            id="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">Час (необов&apos;язково)</Label>
          <Input
            id="time"
            type="time"
            value={form.time || ""}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>

      {form.type === "important" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="title">Назва</Label>
            <Input
              id="title"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Наприклад, Річниця стосунків"
              required
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="grid gap-0.5">
              <Label htmlFor="recurring">Повторюється щороку</Label>
              <p className="text-xs text-muted-foreground">
                День і місяць стануть пріоритетними щороку
              </p>
            </div>
            <Switch
              id="recurring"
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
            <SelectTrigger className="w-full">
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
        <Label htmlFor="note">Нотатка</Label>
        <Textarea
          id="note"
          rows={3}
          value={form.note || ""}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Довільні деталі, спогади, думки..."
          className="resize-none"
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
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent hover:bg-accent"
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
    <div className="inline-flex w-fit gap-0.5 rounded-full border bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-background shadow-sm"
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
            className="p-0.5"
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
    <div className="grid gap-4 rounded-md border p-3">
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
              <Label htmlFor="duration">Тривалість (хв)</Label>
              <Input
                id="duration"
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
                <SelectTrigger className="w-full">
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
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-input bg-transparent hover:bg-accent"
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
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-input bg-transparent hover:bg-accent"
                )}
              >
                {form.partnerFinished ? "💖" : "🤍"} Партнер
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="protectionUsed">Використано захист</Label>
            <Switch
              id="protectionUsed"
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
                <SelectTrigger className="w-full">
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
