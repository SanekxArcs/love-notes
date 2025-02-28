import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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

        <div className="flex justify-center pt-6">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-full"
            >
              Увійти
            </Button>
          </Link>
        </div>

        <div className="pt-12 text-sm opacity-80">
          <p>Створено з любов&apos;ю для того, хто завжди в моєму серці</p>
        </div>
      </div>
    </div>
  );
}
