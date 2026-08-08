"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ThemeSetting() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const themeSwitchId = useId();

  useEffect(() => setIsMounted(true), []);

  const handleThemeChange = useCallback(
    (useDarkTheme: boolean) => setTheme(useDarkTheme ? "dark" : "light"),
    [setTheme],
  );

  const isDark = isMounted && resolvedTheme === "dark";

  return (
    <div className="mb-4 flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/55 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_30px_rgba(71,40,62,.1)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-950/55">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-white/65 bg-white/55 text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.85),0_5px_14px_rgba(80,40,70,.09)] dark:border-white/15 dark:bg-white/10 dark:text-pink-200">
        <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      </div>

      <div className="min-w-0 flex-1">
        <Label htmlFor={themeSwitchId} className="cursor-pointer text-sm font-semibold">
          Оформлення
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isMounted ? (isDark ? "Темна тема" : "Світла тема") : "Завантаження теми…"}
        </p>
      </div>

      <Switch
        id={themeSwitchId}
        checked={isDark}
        onCheckedChange={handleThemeChange}
        disabled={!isMounted}
        aria-label="Увімкнути темну тему"
        className="data-[state=checked]:bg-pink-500 data-[state=unchecked]:bg-zinc-300 dark:data-[state=unchecked]:bg-zinc-700"
      />
    </div>
  );
}
