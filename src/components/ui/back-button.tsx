"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href?: string;
  text: string;
}

export function BackButton({ href, text }: BackButtonProps) {
  const router = useRouter();
  
  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-4 mb-4">
      <Button variant="outline" size="icon" onClick={handleBack} className="shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-2xl font-bold">{text}</h1>
    </div>
  );
}
