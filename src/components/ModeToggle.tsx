
"use client";
import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const setLightTheme = useCallback(() => setTheme("light"), [setTheme]);
  const setDarkTheme = useCallback(() => setTheme("dark"), [setTheme]);
  const setSystemTheme = useCallback(() => setTheme("system"), [setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-[1rem] border border-white/65 bg-white/55 text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_8px_24px_rgba(71,40,62,.14)] backdrop-blur-2xl hover:bg-white/75 hover:text-pink-700 dark:border-white/15 dark:bg-zinc-950/55 dark:text-pink-200 dark:hover:bg-zinc-900/70 dark:hover:text-pink-200"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Перемикач теми</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-[1rem] border-white/65 bg-white/82 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_14px_36px_rgba(71,40,62,.14)] backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/85"
      >
        <DropdownMenuItem onClick={setLightTheme}>
          Світла
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setDarkTheme}>
          Темна
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setSystemTheme}>
          Системна
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
