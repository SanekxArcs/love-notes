"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href?: string;
  text: string;
}

export function BackButton({ href, text }: BackButtonProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  }, [href, router]);

  return (
    <div className="mb-4 flex w-full min-w-0 items-center gap-2 rounded-[1.5rem] border border-white/60 bg-white/55 p-1.5 pr-4 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_10px_30px_rgba(71,40,62,.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-950/55">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleBack}
        aria-label="Назад"
        className="h-10 w-10 shrink-0 rounded-[1rem] border border-white/65 bg-white/55 text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.85),0_5px_14px_rgba(80,40,70,.09)] transition-transform duration-200 hover:bg-white/75 hover:text-pink-700 active:scale-90 dark:border-white/15 dark:bg-white/10 dark:text-pink-200 dark:hover:bg-white/15 dark:hover:text-pink-200"
      >
        <ArrowLeft className="h-[1.15rem] w-[1.15rem] stroke-[1.9]" />
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
        {text}
      </h1>
    </div>
  );
}
