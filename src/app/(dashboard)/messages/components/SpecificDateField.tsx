"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function splitValue(value: string): [string, string] {
  if (!value) return ["", ""];
  const [month, day] = value.split("-");
  return [month ?? "", day ?? ""];
}

function todayValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

interface SpecificDateFieldProps {
  value: string; // "" or "MM-DD"
  onChange: (value: string) => void;
}

export default function SpecificDateField({
  value,
  onChange,
}: SpecificDateFieldProps) {
  const toggleId = useId();
  const [isEnabled, setIsEnabled] = useState(Boolean(value));
  const [month, setMonth] = useState(() => splitValue(value)[0]);
  const [day, setDay] = useState(() => splitValue(value)[1]);

  // Keep local (possibly partial) selection in sync when the committed
  // value changes from outside (form reset, switching edited message).
  useEffect(() => {
    const [nextMonth, nextDay] = splitValue(value);
    setIsEnabled(Boolean(value));
    setMonth(nextMonth);
    setDay(nextDay);
  }, [value]);

  const maxDay = month ? DAYS_IN_MONTH[Number(month) - 1] : 31;

  const handleMonthChange = (nextMonth: string) => {
    const maxDayForMonth = DAYS_IN_MONTH[Number(nextMonth) - 1];
    const clampedDay =
      day && Number(day) > maxDayForMonth
        ? String(maxDayForMonth).padStart(2, "0")
        : day;

    setMonth(nextMonth);
    setDay(clampedDay);
    onChange(clampedDay ? `${nextMonth}-${clampedDay}` : "");
  };

  const handleDayChange = (nextDay: string) => {
    if (!month) return;
    setDay(nextDay);
    onChange(`${month}-${nextDay}`);
  };

  const handleEnabledChange = (enabled: boolean) => {
    setIsEnabled(enabled);

    if (enabled) {
      const initialValue = todayValue();
      const [initialMonth, initialDay] = splitValue(initialValue);
      setMonth(initialMonth);
      setDay(initialDay);
      onChange(initialValue);
    } else {
      setMonth("");
      setDay("");
      onChange("");
    }
  };

  return (
    <div className="grid gap-2.5">
      <label
        htmlFor={toggleId}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-[1.15rem] border border-white/65 bg-white/42 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] dark:border-white/10 dark:bg-white/5"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[.9rem] bg-pink-100 text-pink-700 dark:bg-pink-950/45 dark:text-pink-200">
            <CalendarHeart className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-medium">
              Використати в конкретний день
            </span>
            <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
              Повідомлення матиме пріоритет у вибрану дату
            </span>
          </span>
        </span>
        <Switch
          id={toggleId}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
          className="data-[state=checked]:bg-pink-600"
        />
      </label>

      <AnimatePresence initial={false}>
        {isEnabled ? (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-2 rounded-[1.15rem] border border-pink-200/55 bg-pink-50/30 p-3 dark:border-pink-400/15 dark:bg-pink-950/12">
              <div className="flex gap-2">
                <Select value={month} onValueChange={handleMonthChange}>
                  <SelectTrigger className="h-11 w-full rounded-[1rem] border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/7">
                    <SelectValue placeholder="Місяць" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((name, i) => (
                      <SelectItem
                        key={name}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={day}
                  onValueChange={handleDayChange}
                  disabled={!month}
                >
                  <SelectTrigger className="h-11 w-full rounded-[1rem] border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/7">
                    <SelectValue placeholder="День" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxDay }, (_, i) => i + 1).map(
                      (date) => (
                        <SelectItem
                          key={date}
                          value={String(date).padStart(2, "0")}
                        >
                          {date}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] leading-4 text-muted-foreground">
                Початково вибрано сьогодні. Дата повторюється щороку незалежно
                від року.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
