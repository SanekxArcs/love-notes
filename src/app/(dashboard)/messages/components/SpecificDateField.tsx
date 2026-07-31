"use client";

import { useEffect, useState } from "react";
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

interface SpecificDateFieldProps {
  value: string; // "" or "MM-DD"
  onChange: (value: string) => void;
}

export default function SpecificDateField({
  value,
  onChange,
}: SpecificDateFieldProps) {
  const [month, setMonth] = useState(() => splitValue(value)[0]);
  const [day, setDay] = useState(() => splitValue(value)[1]);

  // Keep local (possibly partial) selection in sync when the committed
  // value changes from outside (form reset, switching edited message).
  useEffect(() => {
    const [nextMonth, nextDay] = splitValue(value);
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

  const handleClear = () => {
    setMonth("");
    setDay("");
    onChange("");
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Особлива дата (необов&apos;язково)
        </span>
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Очистити
          </button>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Місяць" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((name, i) => (
              <SelectItem key={name} value={String(i + 1).padStart(2, "0")}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={day} onValueChange={handleDayChange} disabled={!month}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="День" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <SelectItem key={d} value={String(d).padStart(2, "0")}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-gray-500">
        Це повідомлення матиме пріоритет у цей день і місяць щороку, незалежно
        від року.
      </p>
    </div>
  );
}
