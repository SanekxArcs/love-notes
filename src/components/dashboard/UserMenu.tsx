"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, HelpCircle, LogOut, Database } from "lucide-react";
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
import { CustomTooltip } from "../ui/custom-tooltip";
import { AuthStatus } from "../auth/auth-status";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();

  const { setTheme } = useTheme();
  const user = session?.user;

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
        <Button variant="outline" className="relative h-9 w-9 overflow-hidden">
          <CustomTooltip text="Нлаштування користувача">
            <Avatar className="">
              {user?.image && (
                <AvatarImage
                  src={user.image}
                  alt={user?.name || "User avatar"}
                />
              )}
              <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
            </Avatar>
          </CustomTooltip>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <AuthStatus />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User size={16} />
            <span>Профіль</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-2">
            <HelpCircle size={16} />
            <span>Допомога</span>
          </Link>
        </DropdownMenuItem>
        <WraperIfAdmin>
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Database size={16} />
              <span>База даних</span>
            </Link>
          </DropdownMenuItem>
        </WraperIfAdmin>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Sun 
                size={16} 
                className="block text-base dark:hidden" />
                <Moon
                  size={16}
                  className="hidden  text-amber-50 dark:inline-block"
                />
                <span className="font">Зміна теми</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Світла
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Темна
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                Системна
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Вийти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
