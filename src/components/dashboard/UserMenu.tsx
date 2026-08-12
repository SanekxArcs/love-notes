"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Database, HelpCircle, Link2, LogOut, Moon, Sun, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { WraperIfAdmin } from "@/components/auth/WraperIfAdmin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthStatus } from "../auth/auth-status";
import { useTheme } from "next-themes";

export function UserMenu() {
  const { data: session } = useSession();

  const { setTheme } = useTheme();
  const user = session?.user;
  const setLightTheme = useCallback(() => setTheme("light"), [setTheme]);
  const setDarkTheme = useCallback(() => setTheme("dark"), [setTheme]);
  const setSystemTheme = useCallback(() => setTheme("system"), [setTheme]);
  const handleSignOut = useCallback(() => signOut(), []);

  const getInitials = (name?: string): string => {
    if (!name) return "U";

    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Налаштування користувача"
          title="Налаштування користувача"
          className="relative h-10 w-10 overflow-hidden rounded-[1rem] border-white/60 bg-white/42 p-1 shadow-none hover:bg-white/72 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10"
        >
          <Avatar className="h-8 w-8">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user?.name || "User avatar"} />
            ) : null}
            <AvatarFallback className="bg-pink-100 text-xs font-bold text-pink-700 dark:bg-pink-950/55 dark:text-pink-200">
              {getInitials(user?.name || "")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-[1.25rem] border-white/65 bg-white/78 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_16px_44px_rgba(71,40,62,.16)] backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/82"
      >
        <DropdownMenuItem asChild>
          <AuthStatus />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 rounded-[.8rem]">
            <User size={16} />
            <span>Профіль</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-2 rounded-[.8rem]">
            <HelpCircle size={16} />
            <span>Допомога</span>
          </Link>
        </DropdownMenuItem>
        <WraperIfAdmin>
          <DropdownMenuItem asChild>
            <Link href="/admin/invites" className="flex items-center gap-2 rounded-[.8rem]">
              <Link2 size={16} />
              <span>Публічні запрошення</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2 rounded-[.8rem]">
              <Database size={16} />
              <span>База даних</span>
            </Link>
          </DropdownMenuItem>
        </WraperIfAdmin>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-full justify-start rounded-[.8rem] px-2 font-normal">
                <Sun size={16} className="block text-base dark:hidden" />
                <Moon
                  size={16}
                  className="hidden text-amber-50 dark:inline-block"
                />
                <span>Зміна теми</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-[1rem] border-white/65 bg-white/85 p-1 backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-950/88">
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
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center gap-2 rounded-[.8rem] text-red-600 focus:text-red-600 dark:text-red-300"
        >
          <LogOut size={16} />
          <span>Вийти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
