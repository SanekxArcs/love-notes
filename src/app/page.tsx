"use client";
import { ModeToggle } from "@/components/ModeToggle";
import { Heart } from "lucide-react";
import { AuthState } from "@/components/auth/auth-state";
import Aurora from "@/components/reactbits/Aurora";

export default function LandingPage() {
  // Only render the landing page if user is not authenticated
  return (
    <>
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12">
        <header className="absolute top-0 right-0 p-4">
          <ModeToggle />
        </header>

        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <Heart className="h-16 w-16 text-pink-600 animate-pulse" />
          </div>

          <h1 className="text-4xl font-bold text-pink-600 sm:text-5xl">
            Щоденні повідомлення кохання
          </h1>

          <p className="text-xl">
            Платформа для надсилання щоденних повідомлень любові вашій другій
            половинці. Зробіть кожен день особливим!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <AuthState />
          </div>

          <div className="pt-12 text-sm opacity-80">
            <p>Створено з любов&apos;ю для того, хто завжди в моєму серці</p>
          </div>
        </div>
      </div>
    </>
  );
}
