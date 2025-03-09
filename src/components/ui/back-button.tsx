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
    <div className="flex items-center justify-start gap-4 mb-2">
      <Button variant="outline" size="icon" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl self-center font-bold">{text}</h1>
    </div>
  );
}
